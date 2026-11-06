import { RENDAS, ESCOLARIDADES, INFRAS, pDef } from './data.js'

export function downloadCSV(filename, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = '﻿' + rows.map((r) => r.map(esc).join(';')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const norm = (v) =>
  String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0)
export const avg = (list, fn) => (list.length ? list.reduce((s, x) => s + fn(x), 0) / list.length : 0)

// Tabela de predições (RF05): uma linha por estudante.
export const STUDENT_HEADER = [
  'Estudante', 'Escola', 'Turma', 'Turno', 'Frequência (%)', 'ENEM estimado', 'Faixa mínima', 'Faixa máxima',
  'Risco', 'Prob. de defasagem (%)', 'Renda familiar', 'Escolaridade familiar', 'Infraestrutura domiciliar', 'Plano de apoio',
]
export const studentRow = (s) => [
  s.id, s.school, s.turma, s.shift, s.freq, s.enem, s.lo, s.hi, s.risk, Math.round(pDef(s) * 100),
  RENDAS[s.renda], ESCOLARIDADES[s.esc], INFRAS[s.infra], s.hasPlan ? 'Sim' : 'Não',
]

// Leitor simples de CSV (aceita ; ou , e aspas).
export function parseCSV(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim())
  if (!lines.length) return []
  const count = (c) => (lines[0].match(new RegExp(c, 'g')) || []).length
  const delim = count(';') >= count(',') ? ';' : ','
  const split = (l) => {
    const out = []
    let cur = '', q = false
    for (let i = 0; i < l.length; i++) {
      const c = l[i]
      if (c === '"') { if (q && l[i + 1] === '"') { cur += '"'; i++ } else q = !q }
      else if (c === delim && !q) { out.push(cur); cur = '' }
      else cur += c
    }
    out.push(cur)
    return out.map((x) => x.trim())
  }
  return lines.map(split)
}

// Converte "2", "Médio", "ensino médio" etc. em índice de uma lista de rótulos.
export function parseLevel(v, labels) {
  const t = norm(v)
  if (/^\d+$/.test(t)) return +t < labels.length ? +t : -1
  if (t.length < 3) return -1
  return labels.findIndex((l) => norm(l) === t || norm(l).includes(t))
}
