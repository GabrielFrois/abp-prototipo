import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../Icon.jsx'
import { ENEM_BASE, MT_ALERT, SCHOOLS, applyFilters, getDetail } from '../data.js'
import { downloadCSV, avg, pct } from '../utils.js'
import { useStore } from '../store.jsx'
import MoreFilters, { FILTER_LABELS } from '../Filters.jsx'

// Média nacional do ENEM (referência ilustrativa, média das 4 áreas, sem redação).
// Mesma conta da página Turmas, para os números baterem entre as telas.
const NATIONAL = Object.values(ENEM_BASE).reduce((a, b) => a + b, 0) / Object.values(ENEM_BASE).length
// Diferença (em pts) que ocupa metade da barra de comparação.
const DIFF_MAX = 100
// Percentual de risco elevado que enche a barra por completo (escala fixa, igual para todas as turmas).
const RISK_BAR_MAX = 50

function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = 62, c = 2 * Math.PI * r
  let acc = 0
  return (
    <svg viewBox="0 0 160 160" className="donut" role="img" aria-label="Distribuição de risco">
      <circle cx="80" cy="80" r={r} fill="none" stroke="#eef2f4" strokeWidth="18" />
      {total > 0 && data.map((d) => {
        const len = (d.value / total) * c
        const el = (
          <circle key={d.label} cx="80" cy="80" r={r} fill="none" stroke={d.color} strokeWidth="18"
            strokeDasharray={`${Math.max(0, len - 2)} ${c - len + 2}`} strokeDashoffset={-acc}
            transform="rotate(-90 80 80)" />
        )
        acc += len
        return el
      })}
      <text x="80" y="82" textAnchor="middle" className="donut-total">{total.toLocaleString('pt-BR')}</text>
      <text x="80" y="98" textAnchor="middle" className="axis">estudantes</text>
    </svg>
  )
}

// Barra centrada na média nacional: cresce para a direita (acima) ou para a esquerda (abaixo).
function DiffCell({ diff, enem }) {
  const w = Math.min(50, (Math.abs(diff) / DIFF_MAX) * 50)
  const up = diff >= 0
  const label = diff === 0 ? 'Na média' : `${Math.abs(diff)} pts ${up ? 'acima' : 'abaixo'}`
  return (
    <span className="diff" title={`Média estimada da turma: ${enem} pts · média nacional: ${Math.round(NATIONAL)} pts (ref. ilustrativa)`}>
      <b className={up ? 'up' : 'down'}>{label}</b>
      <span className="diff-track" aria-hidden="true">
        <i className={up ? 'pos' : 'neg'} style={up ? { left: '50%', width: w + '%' } : { right: '50%', width: w + '%' }} />
      </span>
    </span>
  )
}

export default function Overview() {
  const { students, turmas } = useStore()
  const [f, setF] = useState({ school: '', turma: '', renda: '', esc: '', infra: '' })
  const [more, setMore] = useState(false)
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }))

  const list = useMemo(() => applyFilters(students, f), [students, f])
  const total = list.length
  const count = (r) => list.filter((s) => s.risk === r).length
  const high = count('Elevado')
  const risk = [
    { label: 'Elevado', value: high, color: '#c0504d' },
    { label: 'Atenção', value: count('Atenção'), color: '#d4a54a' },
    { label: 'Menor', value: count('Menor'), color: '#0d7c78' },
  ]

  const isLowFreq = (s) => s.freq < 75
  const isNoPlan = (s) => s.risk === 'Elevado' && !s.hasPlan
  const isMatNeed = (s) => getDetail(s).areas.MT < MT_ALERT
  const lowFreq = list.filter(isLowFreq).length
  const noPlan = list.filter(isNoPlan).length
  const matNeed = list.filter(isMatNeed).length

  const turmaRows = turmas.map((t) => {
    const ts = list.filter((s) => s.turma === t.nome)
    const h = ts.filter((s) => s.risk === 'Elevado').length
    const mean = avg(ts, (s) => s.enem)
    return {
      name: t.nome.replace('ª ', 'ª Série '), nome: t.nome, students: ts.length,
      enem: Math.round(mean), diff: Math.round(mean - NATIONAL), high: h, pct: pct(h, ts.length),
    }
  }).filter((t) => t.students > 0)

  // Turma com mais casos de cada sinal (só faz sentido comparar com 2 ou mais turmas).
  const topTurma = (pred) => {
    if (turmaRows.length < 2) return null
    const c = {}
    list.filter(pred).forEach((s) => { c[s.turma] = (c[s.turma] || 0) + 1 })
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0]
    return top ? { turma: top[0], n: top[1] } : null
  }

  const turmaQS = f.turma ? '&turma=' + encodeURIComponent(f.turma) : ''
  const actions = [
    {
      key: 'plano', tone: 'tone-red', n: noPlan, what: 'em risco elevado, sem plano de apoio',
      hint: 'Ainda não há um plano definido para acompanhá-los.',
      cta: 'Definir planos', to: `/estudantes?tab=semplano${turmaQS}`, where: topTurma(isNoPlan),
    },
    {
      key: 'faltas', tone: 'tone-amber', n: lowFreq, what: 'com faltas recorrentes',
      hint: 'Frequência abaixo de 75% nas últimas 4 semanas. Vale conversar sobre o que dificulta a presença.',
      cta: 'Ver estudantes', to: `/estudantes?freqMax=75${turmaQS}`, where: topTurma(isLowFreq),
    },
    {
      key: 'mat', tone: 'tone-teal', n: matNeed, what: 'precisam de reforço em matemática',
      hint: `Estimativa de matemática abaixo de ${MT_ALERT} pts.`,
      cta: 'Planejar reforço', to: `/estudantes?mtMax=${MT_ALERT}${turmaQS}`, where: topTurma(isMatNeed),
    },
  ]

  const nSchools = new Set(list.map((s) => s.school)).size
  const chips = FILTER_LABELS(f)

  const exportSummary = () =>
    downloadCSV('resumo-farol-ia.csv', [
      ['Indicador', 'Valor'],
      ['Estudantes acompanhados', total],
      ['Risco elevado', high],
      ['Atenção', count('Atenção')],
      ['Risco menor', count('Menor')],
      ['Risco elevado sem plano de apoio', noPlan],
      ['Estudantes com frequência < 75%', lowFreq],
      [`Estudantes com matemática estimada < ${MT_ALERT} pts`, matNeed],
      [],
      ['Média nacional do ENEM (ilustrativa)', Math.round(NATIONAL)],
      [],
      ['Turma', 'Estudantes', 'Diferença vs média nacional (pts)', 'Risco elevado', '% da turma'],
      ...turmaRows.map((t) => [t.nome, t.students, t.diff, t.high, t.pct + '%']),
    ])

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">PANORAMA DA REDE</div>
          <h1>Enxergar cedo. Apoiar melhor.</h1>
          <p className="sub">Sinais de aprendizagem e permanência para orientar o cuidado com cada estudante.</p>
        </div>
        <button className="btn" type="button" onClick={exportSummary}><Icon name="download" /> Exportar resumo</button>
      </div>

      <div className="filters-row">
        <select aria-label="Período"><option>2º semestre de 2025</option></select>
        <select value={f.school} onChange={(e) => set('school', e.target.value)} aria-label="Escola">
          <option value="">Toda a rede escolar</option>
          {SCHOOLS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select aria-label="Série"><option>3ª série · Ensino médio</option></select>
        <button className={'btn' + (more ? ' on' : '')} type="button" onClick={() => setMore((v) => !v)}><Icon name="filter" /> Mais filtros</button>
        <span className="muted right small">Atualização ilustrativa · 18 nov. 2025</span>
      </div>
      {more && <MoreFilters f={f} set={set} />}
      {chips.length > 0 && (
        <div className="chips-row">
          <div>
            {chips.map(([k, label]) => (
              <span className="chip" key={k}>{label} <button type="button" aria-label={`Remover ${label}`} onClick={() => set(k, '')}>×</button></span>
            ))}
            <button className="link plain" type="button" onClick={() => setF({ school: '', turma: '', renda: '', esc: '', infra: '' })}>Limpar filtros</button>
          </div>
        </div>
      )}

      <div className="grid-2">
        <section className="card kpi">
          <div className="kpi-top">Estudantes acompanhados <Icon name="users" /></div>
          <div className="kpi-value">{total.toLocaleString('pt-BR')}</div>
          <div className="muted small">{nSchools} {nSchools === 1 ? 'escola' : 'escolas'} · {turmaRows.length} {turmaRows.length === 1 ? 'turma' : 'turmas'}</div>
        </section>
        <section className="card kpi">
          <div className="kpi-top">Em risco elevado <span className="red"><Icon name="flag" /></span></div>
          <div className="kpi-value">{high}</div>
          <div className="muted small">{pct(high, total)}% da seleção · prioridade de escuta</div>
        </section>
      </div>

      <div className="grid-chart">
        <section className="card">
          <div className="card-head">
            <div>
              <h3>Um olhar para cada turma</h3>
              <p className="muted small">3ª série · comparado à média nacional do ENEM ({Math.round(NATIONAL)} pts)</p>
            </div>
            <Link className="link" to="/turmas">Ver turmas ↗</Link>
          </div>
          <table className="mini-table">
            <thead><tr><th>Turma</th><th>Estudantes</th><th>vs. média nacional do ENEM</th><th>Risco elevado</th></tr></thead>
            <tbody>
              {turmaRows.map((t) => (
                <tr key={t.nome}>
                  <td><Icon name="class" /> <Link className="turma-link" to={`/estudantes?turma=${encodeURIComponent(t.nome)}`}>{t.name}</Link></td>
                  <td>{t.students}</td>
                  <td><DiffCell diff={t.diff} enem={t.enem} /></td>
                  <td>
                    <span className="red">{t.high}</span>
                    <span className="bar"><span style={{ width: Math.min(100, (t.pct / RISK_BAR_MAX) * 100) + '%' }} /></span>
                    <span className="muted small">{t.pct}%</span>
                  </td>
                </tr>
              ))}
              {turmaRows.length === 0 && <tr><td colSpan="4" className="empty">Sem turmas na seleção.</td></tr>}
            </tbody>
          </table>
          <p className="muted small">A barra mostra a distância da média da turma até a média nacional (referência ilustrativa, 4 áreas, sem redação). Compare contextos e necessidades, não rankings.</p>
        </section>
        <section className="card">
          <div className="card-head"><div><h3>Distribuição de risco</h3><p className="muted small">Prioridade de acompanhamento na rede</p></div></div>
          <div className="donut-wrap">
            <Donut data={risk} />
            <ul className="risk-list">
              {risk.map((r) => (
                <li key={r.label}>
                  <i className="dot" style={{ background: r.color }} />
                  <span>{r.label}<b>{r.value}</b></span>
                  <em>{pct(r.value, total)}%</em>
                </li>
              ))}
            </ul>
          </div>
          <p className="muted small">Risco de baixo desempenho ou descontinuidade escolar. Faixas ilustrativas para priorizar apoio, não classificar pessoas.</p>
        </section>
      </div>

      <section className="card">
        <h3>Onde agir agora</h3>
        <p className="muted small">Em ordem de prioridade. Cada botão abre a lista de estudantes já filtrada.</p>
        <div className="act-grid">
          {actions.map((a, i) => (
            <article className={'act-card ' + a.tone} key={a.key}>
              <div className="act-top">Prioridade {i + 1}</div>
              <div className="act-num">{a.n}<small>{a.n === 1 ? 'estudante' : 'estudantes'}</small></div>
              <div className="act-label">{a.what}</div>
              {a.n > 0 ? (
                <>
                  <p className="muted small">{a.hint}</p>
                  {a.where && <p className="small act-where">Mais casos: <b>{a.where.turma}</b> ({a.where.n})</p>}
                  <Link className="btn sm act-cta" to={a.to}>{a.cta}</Link>
                </>
              ) : (
                <p className="small act-ok">Nenhum caso na seleção.</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <div className="notice"><Icon name="info" /> Predições são estimativas de apoio à decisão, não destinos individuais. As faixas expressam incerteza ilustrativa; a equipe escolar deve contextualizar cada sinal antes de intervir.</div>
      <footer className="foot"><span>Dados sintéticos. Métricas, pessoas e resultados do modelo são ilustrativos.</span><span>Farol.IA · FATEC Jacareí</span></footer>
    </main>
  )
}