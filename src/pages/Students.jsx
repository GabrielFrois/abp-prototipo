import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../Icon.jsx'
import { SCHOOLS, RISKS, RISK_ORDER, applyFilters } from '../data.js'
import { downloadCSV, STUDENT_HEADER, studentRow } from '../utils.js'
import { useStore } from '../store.jsx'
import CadastroActions from '../Cadastro.jsx'
import MoreFilters, { FILTER_LABELS } from '../Filters.jsx'

const PER_PAGE = 8
const SORTS = [
  ['priority', 'Maior prioridade de apoio'],
  ['freq', 'Menor frequência'],
  ['enem', 'Menor nota estimada'],
]

export default function Students() {
  const nav = useNavigate()
  const { students } = useStore()
  const [sp] = useSearchParams()
  const [f, setF] = useState(() => ({
    q: '', school: '', risk: sp.get('risk') || '', turma: sp.get('turma') || '',
    renda: '', esc: '', infra: '',
    freqMax: +sp.get('freqMax') || 0, mtMax: +sp.get('mtMax') || 0,
  }))
  const [tab, setTab] = useState(sp.get('tab') || 'todos')
  const [more, setMore] = useState(!!(sp.get('turma')))
  const [sort, setSort] = useState('priority')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(new Set())

  const set = (k, v) => { setF((o) => ({ ...o, [k]: v })); setPage(1) }
  const base = useMemo(() => applyFilters(students, f), [students, f])
  const high = base.filter((s) => s.risk === 'Elevado').length
  const semPlano = base.filter((s) => s.risk === 'Elevado' && !s.hasPlan).length

  const filtered = useMemo(() => {
    let list = base.filter((s) =>
      tab === 'elevado' ? s.risk === 'Elevado' : tab === 'semplano' ? s.risk === 'Elevado' && !s.hasPlan : true)
    const by = {
      priority: (a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk] || a.freq - b.freq,
      freq: (a, b) => a.freq - b.freq,
      enem: (a, b) => a.enem - b.enem,
    }[sort]
    return [...list].sort(by)
  }, [base, tab, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const cur = Math.min(page, pages)
  const rows = filtered.slice((cur - 1) * PER_PAGE, cur * PER_PAGE)

  const chips = FILTER_LABELS(f)
  const clear = () => {
    setF({ q: '', school: '', risk: '', turma: '', renda: '', esc: '', infra: '', freqMax: 0, mtMax: 0 })
    setTab('todos'); setPage(1)
  }
  const toggle = (id) => {
    const n = new Set(selected)
    n.has(id) ? n.delete(id) : n.add(id)
    setSelected(n)
  }
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id))
  const toggleAll = () => {
    const n = new Set(selected)
    rows.forEach((r) => (allChecked ? n.delete(r.id) : n.add(r.id)))
    setSelected(n)
  }
  const exportList = () => {
    const src = selected.size ? filtered.filter((s) => selected.has(s.id)) : filtered
    downloadCSV('estudantes-farol-ia.csv', [STUDENT_HEADER, ...src.map(studentRow)])
  }

  const lowFreq = students.filter((s) => s.freq < 75).length
  const total = students.length
  const fcolor = (v) => (v < 75 ? 'red' : 'teal')
  const nextSort = () => setSort(SORTS[(SORTS.findIndex(([k]) => k === sort) + 1) % SORTS.length][0])

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">ACOMPANHAMENTO INDIVIDUAL</div>
          <h1>Estudantes, não apenas indicadores.</h1>
          <p className="sub">Combine sinais acadêmicos com o contexto de cada trajetória para priorizar o apoio.</p>
        </div>
        <button className="btn" type="button" onClick={exportList}><Icon name="download" /> Exportar lista{selected.size ? ` (${selected.size})` : ''}</button>
      </div>

      <section className="card stat-strip">
        <div><b>{total.toLocaleString('pt-BR')}</b><span>estudantes na rede</span></div>
        <div><b className="red">{students.filter((s) => s.risk === 'Elevado').length}</b><span>em risco elevado</span></div>
        <div><b>{lowFreq}</b><span>com frequência abaixo de 75%</span></div>
      </section>

      <div className="toolbar">
        <CadastroActions compact />
      </div>

      <div className="filters-row">
        <label className="search">
          <Icon name="search" />
          <input placeholder="Buscar pelo código do estudante" value={f.q} onChange={(e) => set('q', e.target.value)} />
        </label>
        <select value={f.school} onChange={(e) => set('school', e.target.value)} aria-label="Escola">
          <option value="">Todas as escolas</option>{SCHOOLS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={f.risk} onChange={(e) => set('risk', e.target.value)} aria-label="Risco">
          <option value="">Todos os riscos</option>{RISKS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select aria-label="Período"><option>2º semestre · 2025</option></select>
        <button className={'btn' + (more ? ' on' : '')} type="button" onClick={() => setMore((v) => !v)}><Icon name="filter" /> Mais filtros</button>
      </div>
      {more && <MoreFilters f={f} set={set} />}
      <div className="chips-row">
        <div>
          <span className="chip">3ª série · Ensino médio</span>
          {chips.map(([k, label]) => (
            <span className="chip" key={k}>{label} <button type="button" aria-label={`Remover ${label}`} onClick={() => set(k, k === 'freqMax' || k === 'mtMax' ? 0 : '')}>×</button></span>
          ))}
          <button className="link plain" type="button" onClick={clear}>Limpar filtros</button>
        </div>
        <span className="muted small"><Icon name="shieldsmall" size={12} /> Dados sintéticos e anonimizados</span>
      </div>

      <section className="card table-card">
        <div className="tabs">
          <button type="button" className={tab === 'todos' ? 'on' : ''} onClick={() => { setTab('todos'); setPage(1) }}>Todos <em>{base.length.toLocaleString('pt-BR')}</em></button>
          <button type="button" className={tab === 'elevado' ? 'on' : ''} onClick={() => { setTab('elevado'); setPage(1) }}>Risco elevado <em>{high}</em></button>
          <button type="button" className={tab === 'semplano' ? 'on' : ''} onClick={() => { setTab('semplano'); setPage(1) }}>Sem plano de apoio <em>{semPlano}</em></button>
          <button type="button" className="sort" onClick={nextSort} title="Alternar ordenação">
            <Icon name="sort" size={14} /> {SORTS.find(([k]) => k === sort)[1]}
          </button>
        </div>
        <table className="students">
          <thead>
            <tr>
              <th><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Selecionar todos" /></th>
              <th>Estudante</th><th>Escola</th><th>Turma</th><th>Frequência</th><th>ENEM estimado</th><th>Risco</th><th />
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={s.id} className={i === 0 && cur === 1 && sort === 'priority' ? 'hl' : ''} onClick={() => nav(`/estudantes/${s.id}`)}>
                <td onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} aria-label={`Selecionar ${s.id}`} /></td>
                <td><Link className="id" to={`/estudantes/${s.id}`}>{s.id}</Link><div className="muted small">Identidade protegida</div></td>
                <td>{s.school}</td>
                <td>{s.turma}<div className="muted small">{s.shift}</div></td>
                <td><span className={fcolor(s.freq)}>{s.freq}%</span><span className={'meter ' + fcolor(s.freq)}><i style={{ width: s.freq + '%' }} /></span></td>
                <td><b>{s.enem} pts</b><div className="muted small">{s.lo}–{s.hi}</div></td>
                <td><span className={'tag ' + s.risk}>{s.risk}</span></td>
                <td className="go"><Icon name="chev" size={14} /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="8" className="empty">Nenhum estudante encontrado com esses filtros.</td></tr>}
          </tbody>
        </table>
        <div className="table-foot">
          <span className="muted small">
            {filtered.length === 0 ? 'Exibindo 0 estudantes sintéticos' :
              `Exibindo ${(cur - 1) * PER_PAGE + 1}–${(cur - 1) * PER_PAGE + rows.length} de ${filtered.length.toLocaleString('pt-BR')} estudantes sintéticos`}
          </span>
          <div className="pager">
            <span className="muted small">{PER_PAGE} por página</span>
            <button className="btn sm" type="button" disabled={cur === 1} onClick={() => setPage(cur - 1)}>Anterior</button>
            <span className="page-num">{cur}</span>
            <button className="btn sm" type="button" disabled={cur === pages} onClick={() => setPage(cur + 1)}>Próxima</button>
          </div>
        </div>
      </section>

      <section className="cta">
        <span className="cta-icon"><Icon name="chat" size={18} /></span>
        <div>
          <strong>O próximo passo é uma conversa, não um rótulo.</strong>
          <p>{semPlano} estudantes em risco elevado ainda não têm plano de apoio. Priorize a escuta e identifique barreiras de acesso.</p>
        </div>
        <button className="btn teal" type="button" onClick={() => { setTab('semplano'); setPage(1) }}><Icon name="arrow" /> Revisar sem plano</button>
      </section>

      <div className="notice"><Icon name="info" /> Estimativas ilustrativas, não diagnósticos. Considere o contexto e a escuta do estudante antes de intervir.</div>
      <footer className="foot"><span>Dados sintéticos. Métricas, pessoas e resultados do modelo são ilustrativos.</span><span>Farol.IA · FATEC Jacareí</span></footer>
    </main>
  )
}
