import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'

const SHOW = 8

export default function Interventions() {
  const { students, plans } = useStore()
  const stat = (s) => plans[s.id]?.status || 'A iniciar'
  const cols = [
    { title: 'Sem plano', hint: 'Risco elevado sem plano de apoio', tag: 'Elevado', list: students.filter((s) => s.risk === 'Elevado' && !s.hasPlan) },
    { title: 'A iniciar', hint: 'Plano sugerido, ainda sem início', tag: 'Atenção', list: students.filter((s) => s.hasPlan && stat(s) === 'A iniciar') },
    { title: 'Em andamento', hint: 'Equipe já está conduzindo as etapas', tag: 'Menor', list: students.filter((s) => s.hasPlan && stat(s) === 'Em andamento') },
  ]
  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">PLANOS DE APOIO</div>
          <h1>Intervenções, começando pela escuta.</h1>
          <p className="sub">Acompanhe quem já tem plano e quem ainda precisa de uma conversa. Abra um estudante para criar ou personalizar o plano.</p>
        </div>
      </div>
      <div className="kanban">
        {cols.map((c) => (
          <section className="card" key={c.title}>
            <div className="card-head">
              <div><h3>{c.title}</h3><p className="muted small">{c.hint}</p></div>
              <span className={'tag ' + c.tag}>{c.list.length}</span>
            </div>
            <ul className="mini-list">
              {c.list.slice(0, SHOW).map((s) => (
                <li key={s.id}>
                  <Link className="id" to={`/estudantes/${s.id}`}>{s.id}</Link>
                  <span className="muted small">{s.turma} · {s.school}</span>
                  <span className="small">{s.enem} pts</span>
                </li>
              ))}
              {c.list.length === 0 && <li className="muted small">Nenhum estudante nesta etapa.</li>}
            </ul>
            {c.list.length > SHOW && (
              <Link className="link" to={c.title === 'Sem plano' ? '/estudantes?tab=semplano' : '/estudantes?risk=Elevado'}>Ver todos ({c.list.length}) →</Link>
            )}
          </section>
        ))}
      </div>
      <div className="notice">Planos são sugestões para conversa com estudante e equipe, não rótulos. Registre responsáveis por cargo ou equipe.</div>
      <footer className="foot"><span>Dados sintéticos. Métricas, pessoas e resultados do modelo são ilustrativos.</span><span>Farol.IA · FATEC Jacareí</span></footer>
    </main>
  )
}
