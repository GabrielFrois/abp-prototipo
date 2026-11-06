import React from 'react'
import { useStore } from './store.jsx'
import { RENDAS, ESCOLARIDADES, INFRAS } from './data.js'

// Filtros sociológicos e de turma (RF03). `f` é o objeto de filtros; `set(chave, valor)` o atualiza.
export default function MoreFilters({ f, set }) {
  const { turmas } = useStore()
  const sel = (k, label, items, byIndex) => (
    <label className="fsel">{label}
      <select value={f[k] ?? ''} onChange={(e) => set(k, e.target.value)}>
        <option value="">Todas</option>
        {items.map((it, i) => <option key={it} value={byIndex ? i : it}>{it}</option>)}
      </select>
    </label>
  )
  return (
    <div className="more-filters card">
      {sel('turma', 'Turma', turmas.map((t) => t.nome))}
      {sel('renda', 'Faixa de renda', RENDAS, true)}
      {sel('esc', 'Escolaridade familiar', ESCOLARIDADES, true)}
      {sel('infra', 'Infraestrutura domiciliar', INFRAS, true)}
    </div>
  )
}

export const FILTER_LABELS = (f) => {
  const out = []
  if (f.q) out.push(['q', `Código: ${f.q}`])
  if (f.school) out.push(['school', f.school])
  if (f.risk) out.push(['risk', `Risco ${f.risk.toLowerCase()}`])
  if (f.turma) out.push(['turma', `Turma ${f.turma}`])
  if (f.renda !== undefined && f.renda !== '') out.push(['renda', RENDAS[f.renda]])
  if (f.esc !== undefined && f.esc !== '') out.push(['esc', `Família: ${ESCOLARIDADES[f.esc].toLowerCase()}`])
  if (f.infra !== undefined && f.infra !== '') out.push(['infra', `Infra ${INFRAS[f.infra].toLowerCase()}`])
  if (f.freqMax) out.push(['freqMax', `Frequência < ${f.freqMax}%`])
  if (f.mtMax) out.push(['mtMax', `Matemática < ${f.mtMax} pts`])
  return out
}
