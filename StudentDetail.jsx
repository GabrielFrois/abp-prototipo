import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../Icon.jsx'
import { getDetail, MONTHS, RENDAS, ESCOLARIDADES, INFRAS, pDef, ENEM_BASE } from '../data.js'
import { useStore } from '../store.jsx'
import Modal from '../Modal.jsx'

function LineChart({ values }) {
  const W = 560, H = 190, L = 34, R = 20, T = 14, B = 26
  const x = (i) => L + ((W - L - R) * i) / (values.length - 1)
  const y = (v) => T + (H - T - B) * (1 - v / 10)
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Trajetória de aprendizagem">
      {[0, 2, 4, 6, 8, 10].map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid-line" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" className="axis">{t}</text>
        </g>
      ))}
      <path d={d} fill="none" stroke="#0d7c78" strokeWidth="2" />
      {values.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r="3.5" fill="#fff" stroke="#0d7c78" strokeWidth="2" />
          <text x={x(i)} y={y(v) - 10} textAnchor="middle" className="point-label">{v.toFixed(1).replace('.', ',')}</text>
          <text x={x(i)} y={H - 6} textAnchor="middle" className="axis">{MONTHS[i]}</text>
        </g>
      ))}
    </svg>
  )
}

const STEPS = [
  { t: 'Acolhimento e escuta', d: 'Entender faltas e combinar próximos passos.', who: 'Coordenação', due: 'Até 20 nov.' },
  { t: 'Reforço em matemática', d: 'Sugerir 2 encontros semanais e material acessível.', who: 'Docente', due: 'Até 24 nov.' },
  { t: 'Verificar acesso e permanência', d: 'Avaliar conectividade e apoio ao transporte.', who: 'Equipe escolar', due: 'Até 25 nov.' },
]
const STATUS = ['A iniciar', 'Em andamento']

function PlanModal({ plan, onSave, onClose }) {
  const [status, setStatus] = useState(plan?.status || 'A iniciar')
  const [owners, setOwners] = useState(plan?.owners || ['', '', ''])
  const setOwner = (i) => (e) => setOwners(owners.map((o, k) => (k === i ? e.target.value : o)))
  return (
    <Modal title="Personalizar plano de acompanhamento" onClose={onClose}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); onSave({ status, owners }) }}>
        <p className="muted small">Defina a situação e quem conduz cada etapa. Use cargos ou equipes, não nomes de estudantes.</p>
        <label>Situação do plano
          <select value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS.map((x) => <option key={x}>{x}</option>)}</select>
        </label>
        {STEPS.map((st, i) => (
          <label key={st.t}>{i + 1}. {st.t} — responsável
            <input value={owners[i]} onChange={setOwner(i)} placeholder={st.who} />
          </label>
        ))}
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn teal">Salvar plano</button>
        </div>
      </form>
    </Modal>
  )
}

export default function StudentDetail() {
  const { id } = useParams()
  const { students, plans, setPlan } = useStore()
  const [editing, setEditing] = useState(false)
  const s = students.find((x) => x.id === id)
  if (!s) {
    return (
      <main className="page">
        <h1>Estudante não encontrado</h1>
        <p className="sub">O código informado não existe nesta base.</p>
        <Link className="link" to="/estudantes">← Voltar para Estudantes</Link>
      </main>
    )
  }
  const d = getDetail(s)
  const fmt = (n) => String(n).replace('.', ',')
  const lastDelta = d.traj ? +(d.traj[4] - d.traj[3]).toFixed(1) : 0
  const pos = (v) => (v / 1000) * 100
  const lowFreq = s.freq < 75
  const plan = plans[s.id]
  const hasPlan = s.hasPlan
  const status = plan?.status || (hasPlan ? 'A iniciar' : null)
  const owners = plan?.owners || []
  const limitedAccess = s.infra === 0
  const prob = Math.round(pDef(s) * 100)
  const baseAvg = Math.round(Object.values(ENEM_BASE).reduce((a, b) => a + b, 0) / 4)
  const delta = s.enem - baseAvg

  return (
    <main className="page">
      <div className="back"><Link to="/estudantes"><Icon name="back" size={12} /> Estudantes</Link> <span className="muted">/ {s.id}</span></div>

      <div className="student-head">
        <span className="avatar"><Icon name="user" size={22} /></span>
        <div>
          <h1>Estudante {s.id} <span className={'tag big ' + s.risk}>{s.risk === 'Elevado' ? 'Risco elevado' : s.risk === 'Atenção' ? 'Atenção' : 'Risco menor'}</span></h1>
          <p className="sub">{s.school} · {s.turma.replace('ª ', 'ª série ')} · {s.shift} · Ensino médio</p>
          <p className="muted small"><Icon name="shieldsmall" size={12} /> {s.custom ? 'Cadastro pseudonimizado · sem nome ou dado pessoal' : 'Perfil sintético e anônimo · nenhum dado pessoal real'}</p>
        </div>
      </div>

      <section className="card stat-strip">
        <div><span className="muted small">Frequência recente</span><b className={lowFreq ? 'red' : 'teal'}>{s.freq}%</b><span className="muted small">Últimas 4 semanas</span></div>
        <div><span className="muted small">Diagnóstico {s.custom ? 'estimado' : 'atual'}</span><b>{fmt(d.diag.toFixed(1))} / 10</b><span className="muted small">{s.custom ? 'Derivado da estimativa de nota' : 'Média das áreas avaliadas'}</span></div>
        <div><span className="muted small">Variação de frequência</span>
          {d.variation === null ? <b className="muted">—</b> : <b className={d.variation < 0 ? 'amber' : 'teal'}>{d.variation > 0 ? '+' : d.variation < 0 ? '−' : ''}{Math.abs(d.variation)} p.p.</b>}
          <span className="muted small">{d.variation === null ? 'Sem histórico (cadastro recente)' : 'Em relação às 4 semanas anteriores'}</span></div>
      </section>

      <div className="grid-detail">
        <section className="card dark score">
          <div className="card-head"><h3>Desempenho estimado</h3><Icon name="scan" /></div>
          <div className="score-num">{s.enem} <small>pontos</small></div>
          <div className="band-row"><span>Faixa ilustrativa</span><b>{s.lo}–{s.hi} pts</b></div>
          <div className="track">
            <i className="band" style={{ left: pos(s.lo) + '%', width: pos(s.hi - s.lo) + '%' }} />
            <i className="knob" style={{ left: pos(s.enem) + '%' }} />
          </div>
          <div className="track-lbl"><span>0</span><span>1.000</span></div>
          <div className="areas">
            {Object.entries(d.areas).map(([k, v]) => (<div key={k}><small>{k}</small><b>{v}</b></div>))}
          </div>
          <p className="small soft">Média das quatro áreas, sem redação. Estimativa não determina a nota futura.</p>
          <p className="small soft">Probabilidade ilustrativa de defasagem: <b>{prob}%</b> · {delta >= 0 ? '+' : '−'}{Math.abs(delta)} pts vs média histórica ENEM (ref. ilustrativa).</p>
        </section>

        <section className="card">
          <div className="card-head">
            <div><h3>Trajetória de aprendizagem</h3><p className="muted small">Média nos diagnósticos escolares · escala de 0 a 10</p></div>
            {d.traj && <span className={'pill ' + (lastDelta >= 0 ? '' : 'neg')}>{lastDelta >= 0 ? '+' : '−'}{fmt(Math.abs(lastDelta))} ponto no último mês</span>}
          </div>
          {d.traj ? (
            <>
              <div className="legend small muted"><span><i className="sw teal" /> Diagnóstico mensal</span></div>
              <LineChart values={d.traj} />
              <p className="muted small">Recuperação recente em novembro. Observe a evolução junto à frequência e à escuta.</p>
            </>
          ) : (
            <p className="empty">Estudante cadastrado recentemente: ainda não há diagnósticos mensais. A trajetória aparecerá conforme novos diagnósticos forem registrados.</p>
          )}
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <div><h3>Sinais e contexto associados</h3><p className="muted small">Associações no cenário simulado, não causas individuais</p></div>
            <Link className="link" to="/modelo">Como interpretar ↗</Link>
          </div>
          <ul className="signals">
            <li><span className={lowFreq ? 'red' : 'teal'}><Icon name="calendar" /></span><div><b>Frequência nas últimas 4 semanas</b><small>Sinal acadêmico · {lowFreq ? 'Investigar barreiras de presença e transporte.' : 'Dentro do esperado; manter acompanhamento.'}</small></div><em className={lowFreq ? 'red' : 'teal'}>{s.freq}%</em></li>
            <li><span className={d.mat < 6 ? 'amber' : 'teal'}><Icon name="book" /></span><div><b>Diagnóstico de matemática</b><small>Sinal acadêmico · {d.mat < 6 ? 'Oferecer reforço em resolução de problemas.' : 'Sem alerta específico.'}</small></div><em className={d.mat < 6 ? 'amber' : 'teal'}>{fmt(d.mat.toFixed(1))} / 10</em></li>
            <li><span><Icon name="wifioff" /></span><div><b>{limitedAccess ? 'Acesso digital limitado' : 'Acesso digital'}</b><small>Contexto de acesso · {limitedAccess ? 'Checar conectividade e acesso a materiais offline.' : `Infraestrutura domiciliar ${INFRAS[s.infra].toLowerCase()}.`}</small></div><em className="teal">{limitedAccess ? 'A verificar' : 'Sem alerta'}</em></li>
          </ul>
          <div className="profile-chips">
            <span>Renda: {RENDAS[s.renda]}</span>
            <span>Família: {ESCOLARIDADES[s.esc].toLowerCase()}</span>
            <span>Infra: {INFRAS[s.infra].toLowerCase()}</span>
          </div>
          <div className="callout"><Icon name="heart" /> Condições socioeconômicas indicam barreiras a enfrentar, nunca culpa ou falta de potencial do estudante.</div>
        </section>

        <section className="card">
          <div className="card-head">
            <div><h3>Plano de acompanhamento</h3><p className="muted small">Sugestão inicial · revisar com estudante e equipe</p></div>
          </div>
          <div className="plan-top">
            <span className={'tag ' + (status === 'Em andamento' ? '' : 'Atenção')}>{status || 'Sem plano formalizado'}</span>
            <span className="muted small">{owners.some(Boolean) ? 'Responsáveis definidos' : 'Responsável ainda não definido'}</span>
          </div>
          <ol className="plan">
            {STEPS.map((st, i) => (
              <li key={st.t}><span>{i + 1}</span><div><b>{st.t}</b><small>{st.d}</small><small className="muted">{st.who} · {owners[i] || 'a definir'}</small></div><em>{st.due}</em></li>
            ))}
          </ol>
          <div className="plan-foot"><span className="muted small">Revisão sugerida · 25 nov. 2025</span><button type="button" className="link plain" onClick={() => setEditing(true)}>{hasPlan ? 'Personalizar plano →' : 'Criar plano →'}</button></div>
        </section>
      </div>
      {editing && <PlanModal plan={plan} onClose={() => setEditing(false)} onSave={(p) => { setPlan(s.id, p); setEditing(false) }} />}

      <div className="notice"><Icon name="info" /> Predições são estimativas de apoio à decisão, não destinos individuais. As faixas expressam incerteza ilustrativa; a equipe escolar deve contextualizar cada sinal antes de intervir.</div>
      <div className="grid-2 says">
        <div><b>O que informa esta visão</b><p className="muted small">Microdados socioeconômicos e acadêmicos simulados, frequência e diagnósticos escolares. Atualização ilustrativa: 18 nov. 2025.</p></div>
        <div><b>O que esta visão não diz</b><p className="muted small">Não mede potencial, não comprova causalidade e não substitui avaliação pedagógica. O protótipo não apresenta validação nem acurácia real.</p></div>
      </div>
      <footer className="foot"><span>Dados sintéticos. Métricas, pessoas e resultados do modelo são ilustrativos.</span><span>Farol.IA · FATEC Jacareí</span></footer>
    </main>
  )
}
