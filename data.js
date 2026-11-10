// Dados 100% sintéticos e anonimizados — nenhum dado pessoal real.

function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(2026)
const between = (a, b) => a + rnd() * (b - a)
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]

export const SCHOOLS = ['Escola Horizonte', 'Escola Ipê', 'Escola Caminhos', 'Escola Nascente']
export const RISKS = ['Elevado', 'Atenção', 'Menor']
const TURMAS = ['3ª A', '3ª B', '3ª C', '3ª D']
export const BASE_TURMAS = TURMAS.map((nome) => ({ nome, turno: 'Manhã' }))

const fixed = [
  { n: 248, school: 'Escola Horizonte', turma: '3ª A', freq: 71, enem: 508, lo: 470, hi: 546, risk: 'Elevado' },
  { n: 186, school: 'Escola Ipê', turma: '3ª C', freq: 73, enem: 495, lo: 452, hi: 538, risk: 'Elevado' },
  { n: 392, school: 'Escola Caminhos', turma: '3ª B', freq: 79, enem: 521, lo: 480, hi: 562, risk: 'Elevado' },
  { n: 107, school: 'Escola Nascente', turma: '3ª A', freq: 81, enem: 516, lo: 477, hi: 555, risk: 'Elevado' },
  { n: 514, school: 'Escola Horizonte', turma: '3ª B', freq: 83, enem: 549, lo: 514, hi: 584, risk: 'Atenção' },
  { n: 723, school: 'Escola Ipê', turma: '3ª A', freq: 86, enem: 558, lo: 520, hi: 596, risk: 'Atenção' },
  { n: 631, school: 'Escola Caminhos', turma: '3ª C', freq: 91, enem: 572, lo: 539, hi: 605, risk: 'Atenção' },
  { n: 905, school: 'Escola Nascente', turma: '3ª B', freq: 95, enem: 624, lo: 589, hi: 659, risk: 'Menor' },
]

const fmtId = (n) => 'E-' + String(n).padStart(4, '0')

function build() {
  const used = new Set(fixed.map((f) => f.n))
  const nums = []
  for (let i = 1; i <= 1248; i++) if (!used.has(i)) nums.push(i)

  // 1240 restantes: 246 elevado, 371 atenção, 623 menor
  const risks = [
    ...Array(246).fill('Elevado'),
    ...Array(371).fill('Atenção'),
    ...Array(623).fill('Menor'),
  ]
  for (let i = risks.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[risks[i], risks[j]] = [risks[j], risks[i]]
  }

  let lowFreq = 30 // 32 no total com frequência < 75% (2 já nos fixos)
  const rest = nums.map((n, i) => {
    const risk = risks[i]
    let freq, enem
    if (risk === 'Elevado') {
      if (lowFreq > 0) { freq = Math.round(between(68, 74.4)); lowFreq-- }
      else freq = Math.round(between(75, 88))
      enem = Math.round(between(450, 530))
    } else if (risk === 'Atenção') {
      freq = Math.round(between(78, 93)); enem = Math.round(between(520, 575))
    } else {
      freq = Math.round(between(88, 100)); enem = Math.round(between(575, 680))
    }
    const half = Math.round(between(34, 42))
    return {
      n, risk, freq, enem, lo: enem - half, hi: enem + half,
      school: pick(SCHOOLS), turma: pick(TURMAS),
    }
  })

  const all = [...fixed, ...rest.sort((a, b) => a.n - b.n)].map((s) => ({
    id: fmtId(s.n), school: s.school, turma: s.turma, shift: 'Manhã',
    freq: s.freq, enem: s.enem, lo: s.lo, hi: s.hi, risk: s.risk, hasPlan: true,
  }))

  // 64 estudantes em risco elevado sem plano de apoio
  let sem = 0
  for (let i = all.length - 1; i >= 0 && sem < 64; i--) {
    if (all[i].risk === 'Elevado' && all[i].id !== 'E-0248') { all[i].hasPlan = false; sem++ }
  }
  return all
}

export const RENDAS = ['Até 1 salário mínimo', '1 a 2 salários mínimos', '2 a 5 salários mínimos', 'Mais de 5 salários mínimos']
export const ESCOLARIDADES = ['Ensino fundamental', 'Ensino médio', 'Ensino superior']
export const INFRAS = ['Básica', 'Intermediária', 'Completa']
export const AREAS = [
  { key: 'LC', name: 'Linguagens', off: 12, gain: 30 },
  { key: 'CH', name: 'Humanas', off: 32, gain: 27 },
  { key: 'CN', name: 'Natureza', off: -16, gain: 22 },
  { key: 'MT', name: 'Matemática', off: -28, gain: 23 },
]
// Médias de referência ILUSTRATIVAS da base histórica do ENEM (RF04).
// Substituir pelas médias calculadas na base de microdados tratada (Kaggle).
export const ENEM_BASE = { LC: 560, CH: 575, CN: 530, MT: 560 }
// Limite (pts) da estimativa de matemática que aciona o alerta de reforço.
export const MT_ALERT = 460

// Modelo ILUSTRATIVO (regra linear sobre o perfil sociológico).
// Ponto de troca: substituir por uma chamada à API de ML treinada (RF02).
export function predict({ renda, esc, infra }) {
  const enem = Math.round(478 + 28 * renda + 22 * esc + 18 * infra)
  return { enem, lo: enem - 38, hi: enem + 38 }
}
export function classify(enem, freq) {
  if (enem <= 530 || freq < 75) return 'Elevado'
  if (enem <= 575 || freq < 85) return 'Atenção'
  return 'Menor'
}
// Probabilidade ilustrativa de defasagem (logística sobre nota estimada e frequência).
export function pDef(s) {
  const z = (540 - s.enem) / 28 + (85 - s.freq) / 10
  return 1 / (1 + Math.exp(-z))
}

function enrich(list) {
  const r = mulberry32(77)
  const gauss = () => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()) }
  const lv = (q, max, sd) => Math.max(0, Math.min(max, Math.round(q * max + gauss() * sd)))
  return list.map((s) => {
    const q = Math.max(0, Math.min(1, (s.enem - 450) / 230))
    const x = { ...s, renda: lv(q, 3, 0.9), esc: lv(q, 2, 0.7), infra: lv(q, 2, 0.7) }
    if (s.id === 'E-0248') Object.assign(x, { renda: 0, esc: 1, infra: 0 })
    return x
  })
}
export const STUDENTS = enrich(build())

export function makeStudent({ id, school, turma, shift, freq, renda, esc, infra }) {
  const p = predict({ renda, esc, infra })
  return { id, school, turma, shift, freq, enem: p.enem, lo: p.lo, hi: p.hi,
    risk: classify(p.enem, freq), hasPlan: false, renda, esc, infra, custom: true }
}

export function applyFilters(list, f) {
  const q = (f.q || '').trim().toLowerCase()
  const eq = (v, x) => v === '' || v === undefined || +v === x
  return list.filter((s) =>
    (!q || s.id.toLowerCase().includes(q)) &&
    (!f.school || s.school === f.school) &&
    (!f.turma || s.turma === f.turma) &&
    (!f.risk || s.risk === f.risk) &&
    eq(f.renda, s.renda) && eq(f.esc, s.esc) && eq(f.infra, s.infra) &&
    (!f.freqMax || s.freq < f.freqMax) &&
    (!f.mtMax || getDetail(s).areas.MT < f.mtMax))
}

export const RISK_ORDER = { Elevado: 0, Atenção: 1, Menor: 2 }

export function getDetail(s) {
  const n = parseInt(s.id.slice(2), 10)
  const isMock = s.id === 'E-0248'
  const diag = isMock ? 5.4 : Math.max(2, Math.min(9.5, +((s.enem - 200) / 57).toFixed(1)))
  const mat = isMock ? 4.8 : +(diag - 0.6).toFixed(1)
  const areas = isMock
    ? { LC: 520, CH: 540, CN: 492, MT: 480 }
    : { LC: s.enem + 12, CH: s.enem + 32, CN: s.enem - 16, MT: s.enem - 28 }
  const fresh = !!s.custom
  const variation = fresh ? null : isMock ? -6 : ((n * 7) % 13) - 8
  const traj = fresh ? null : isMock
    ? [6.4, 6.1, 5.8, 5.0, 5.4]
    : [diag + 0.9, diag + 0.6, diag + 0.3, diag - 0.4, diag].map((v) => +Math.max(0.5, Math.min(10, v)).toFixed(1))
  return { diag, mat, areas, variation, traj }
}

export const MONTHS = ['Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.']
