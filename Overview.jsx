import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../Icon.jsx'
import { AREAS, ENEM_BASE, MT_ALERT, SCHOOLS, applyFilters, getDetail } from '../data.js'
import { downloadCSV, avg, pct } from '../utils.js'
import { useStore } from '../store.jsx'
import MoreFilters, { FILTER_LABELS } from '../Filters.jsx'

function BarChart({ data }) {
  const W = 600, H = 190, L = 40, B = 24, T = 10
  const min = 400, max = 700
  const y = (v) => T + (H - T - B) * (1 - (Math.max(min, Math.min(max, v)) - min) / (max - min))
  const slot = (W - L) / data.length
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Desempenho previsto por área, com a média histórica do ENEM">
      {[400, 500, 600, 700].map((t) => (
        <g key={t}>
          <line x1={L} x2={W} y1={y(t)} y2={y(t)} className="grid-line" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" className="axis">{t}</text>
        </g>
      ))}
      <line x1={L} x2={W} y1={y(600)} y2={y(600)} className="ref-line" />
      {data.map((a, i) => {
        const cx = L + slot * i + slot / 2
        const bw = 30
        return (
          <g key={a.name}>
            <rect x={cx - bw - 2} y={y(a.initial)} width={bw} height={y(min) - y(a.initial)} rx="3" className="bar-initial" />
            <rect x={cx + 2} y={y(a.current)} width={bw} height={y(min) - y(a.current)} rx="3" className="bar-current" />
            <text x={cx + 2 + bw / 2} y={y(a.current) + 15} textAnchor="middle" className="bar-label">{Math.round(a.current)}</text>
            <line x1={cx - bw - 8} x2={cx + bw + 8} y1={y(a.base)} y2={y(a.base)} className="base-line" />
            <text x={cx} y={H - 6} textAnchor="middle" className="axis">{a.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

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
  const lowFreq = list.filter((s) => s.freq < 75).length
  const matNeed = list.filter((s) => getDetail(s).areas.MT < MT_ALERT).length

  const areas = useMemo(() => AREAS.map((a) => {
    const current = avg(list, (s) => getDetail(s).areas[a.key])
    return { name: a.name, current, initial: current - a.gain, base: ENEM_BASE[a.key], key: a.key }
  }), [list])

  const turmaRows = turmas.map((t) => {
    const ts = list.filter((s) => s.turma === t.nome)
    const h = ts.filter((s) => s.risk === 'Elevado').length
    return { name: t.nome.replace('ª ', 'ª Série '), nome: t.nome, students: ts.length, enem: Math.round(avg(ts, (s) => s.enem)), high: h, pct: pct(h, ts.length) }
  }).filter((t) => t.students > 0)

  const nSchools = new Set(list.map((s) => s.school)).size
  const chips = FILTER_LABELS(f)

  const exportSummary = () =>
    downloadCSV('resumo-farol-ia.csv', [
      ['Indicador', 'Valor'],
      ['Estudantes acompanhados', total],
      ['Risco elevado', high],
      ['Atenção', count('Atenção')],
      ['Risco menor', count('Menor')],
      ['Estudantes com frequência < 75%', lowFreq],
      [],
      ['Área', 'Estimativa atual', 'Diagnóstico inicial', 'Média base ENEM (ilustrativa)', 'Diferença vs base'],
      ...areas.map((a) => [a.name, Math.round(a.current), Math.round(a.initial), a.base, Math.round(a.current - a.base)]),
      [],
      ['Turma', 'Estudantes', 'ENEM estimado', 'Risco elevado', '% da turma'],
      ...turmaRows.map((t) => [t.nome, t.students, t.enem, t.high, t.pct + '%']),
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
            <div><h3>Desempenho previsto</h3><p className="muted small">Média por área · escala de pontos · sem redação</p></div>
            <Link className="link" to="/modelo">Entender estimativa ↗</Link>
          </div>
          <div className="legend small muted">
            <span><i className="sw light" /> Diagnóstico inicial</span>
            <span><i className="sw teal" /> Estimativa atual</span>
            <span><i className="sw dash" /> Referência pedagógica: 600</span>
            <span><i className="sw base" /> Média histórica ENEM</span>
          </div>
          {total ? <BarChart data={areas} /> : <p className="empty">Nenhum estudante na seleção.</p>}
          {total > 0 && (
            <div className="cmp">
              {areas.map((a) => {
                const d = Math.round(a.current - a.base)
                return <span key={a.key} className={d >= 0 ? 'up' : 'down'}><b>{a.name}</b> {d >= 0 ? '+' : '−'}{Math.abs(d)} vs base</span>
              })}
            </div>
          )}
          <p className="muted small">Comparativo com a base histórica do ENEM (valores de referência ilustrativos).</p>
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

      <div className="grid-bottom">
        <section className="card">
          <h3>Onde agir agora</h3>
          <p className="muted small">Sinais que merecem uma conversa</p>
          <div className="action">
            <div className="action-title amber"><Icon name="calendar" /> {lowFreq} estudantes com faltas recorrentes</div>
            <p className="muted small">Frequência abaixo de 75% nas últimas 4 semanas. Investigue barreiras de permanência.</p>
            <Link className="link" to={`/estudantes?freqMax=75${f.turma ? '&turma=' + encodeURIComponent(f.turma) : ''}`}>Revisar estudantes prioritários →</Link>
          </div>
          <div className="action">
            <div className="action-title"><Icon name="book" /> {matNeed} precisam de apoio em matemática</div>
            <p className="muted small">Estimativa de matemática abaixo de {MT_ALERT} pts, bem distante da referência pedagógica.</p>
            <Link className="link" to={`/estudantes?mtMax=${MT_ALERT}`}>Planejar reforço direcionado →</Link>
          </div>
        </section>
        <section className="card">
          <div className="card-head">
            <div><h3>Um olhar para cada Turma</h3><p className="muted small">Unidades fictícias · 3ª série do ensino médio</p></div>
            <Link className="link" to="/turmas">Ver Turmas ↗</Link>
          </div>
          <table className="mini-table">
            <thead><tr><th>Turma</th><th>Estudantes</th><th>ENEM estimado</th><th>Risco elevado</th></tr></thead>
            <tbody>
              {turmaRows.map((t) => (
                <tr key={t.nome}>
                  <td><Icon name="class" /> {t.name}</td>
                  <td>{t.students}</td>
                  <td><b>{t.enem} pts</b></td>
                  <td>
                    <span className="red">{t.high}</span>
                    <span className="bar"><span style={{ width: Math.min(100, t.pct * 3) + '%' }} /></span>
                    <span className="muted small">{t.pct}%</span>
                  </td>
                </tr>
              ))}
              {turmaRows.length === 0 && <tr><td colSpan="4" className="empty">Sem turmas na seleção.</td></tr>}
            </tbody>
          </table>
          <p className="muted small">Compare contextos e necessidades, não rankings de escolas.</p>
        </section>
      </div>

      <div className="notice"><Icon name="info" /> Predições são estimativas de apoio à decisão, não destinos individuais. As faixas expressam incerteza ilustrativa; a equipe escolar deve contextualizar cada sinal antes de intervir.</div>
      <footer className="foot"><span>Dados sintéticos. Métricas, pessoas e resultados do modelo são ilustrativos.</span><span>Farol.IA · FATEC Jacareí</span></footer>
    </main>
  )
}
