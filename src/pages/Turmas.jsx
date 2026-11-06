import React from 'react'
import { Link } from 'react-router-dom'
import Icon from '../Icon.jsx'
import CadastroActions from '../Cadastro.jsx'
import { useStore } from '../store.jsx'
import { AREAS, ENEM_BASE, getDetail } from '../data.js'
import { downloadCSV, avg, pct, STUDENT_HEADER, studentRow } from '../utils.js'

const slug = (t) => t.replace(/\s+/g, '').replace('ª', 'a')

export default function Turmas() {
  const { students, turmas } = useStore()
  const baseAvg = Object.values(ENEM_BASE).reduce((a, b) => a + b, 0) / 4

  const stats = (t) => {
    const ts = students.filter((s) => s.turma === t.nome)
    const high = ts.filter((s) => s.risk === 'Elevado')
    return { ts, high, enem: avg(ts, (s) => s.enem) }
  }

  // Relatório gerencial por turma (RF05): resumo, comparativo com a base ENEM e alunos prioritários.
  const report = (t) => {
    const { ts, high, enem } = stats(t)
    const att = ts.filter((s) => s.risk === 'Atenção').length
    downloadCSV(`relatorio-turma-${slug(t.nome)}.csv`, [
      ['Relatório pedagógico', `Turma ${t.nome} (${t.turno})`],
      ['Estudantes', ts.length], ['ENEM estimado (média)', Math.round(enem)],
      ['Risco elevado', high.length], ['Atenção', att], ['Risco menor', ts.length - high.length - att],
      [],
      ['Área', 'Estimativa da turma', 'Média base ENEM (ilustrativa)', 'Diferença'],
      ...AREAS.map((a) => {
        const m = avg(ts, (s) => getDetail(s).areas[a.key])
        return [a.name, Math.round(m), ENEM_BASE[a.key], Math.round(m - ENEM_BASE[a.key])]
      }),
      [],
      ['Estudantes prioritários (risco elevado)'],
      STUDENT_HEADER,
      ...[...high].sort((a, b) => a.enem - b.enem).map(studentRow),
    ])
  }
  const predictions = (t) => {
    const ts = t ? students.filter((s) => s.turma === t.nome) : students
    downloadCSV(t ? `predicoes-turma-${slug(t.nome)}.csv` : 'predicoes-todas-as-turmas.csv', [STUDENT_HEADER, ...ts.map(studentRow)])
  }

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">GESTÃO DE TURMAS</div>
          <h1>Turmas e cadastro sociológico.</h1>
          <p className="sub">Crie turmas, cadastre estudantes individualmente ou em lote e baixe relatórios pedagógicos.</p>
        </div>
        <button className="btn" type="button" onClick={() => predictions(null)}><Icon name="download" /> Exportar todas as predições</button>
      </div>
      <div className="toolbar"><CadastroActions /></div>

      <div className="turma-grid">
        {turmas.map((t) => {
          const { ts, high, enem } = stats(t)
          const diff = Math.round(enem - baseAvg)
          return (
            <section className="card turma" key={t.nome}>
              <div className="card-head">
                <div><h3>{t.nome.replace('ª ', 'ª Série ')}</h3><p className="muted small">{t.turno}{t.custom ? ' · criada por você' : ''}</p></div>
                <Icon name="class" size={18} />
              </div>
              <div className="turma-stats">
                <div><b>{ts.length}</b><small className="muted">estudantes</small></div>
                <div><b>{ts.length ? Math.round(enem) : '—'}</b><small className="muted">ENEM estimado</small></div>
                <div><b className="red">{high.length}</b><small className="muted">risco elevado ({pct(high.length, ts.length)}%)</small></div>
              </div>
              <p className="small muted">{ts.length ? <>Média da turma {diff >= 0 ? '+' : '−'}{Math.abs(diff)} pts vs base histórica do ENEM (ref. ilustrativa).</> : 'Sem estudantes cadastrados nesta turma.'}</p>
              <div className="turma-actions">
                <Link className="btn sm" to={`/estudantes?turma=${encodeURIComponent(t.nome)}`}>Ver estudantes</Link>
                <button className="btn sm" type="button" onClick={() => report(t)} disabled={!ts.length}><Icon name="download" size={13} /> Relatório</button>
                <button className="btn sm" type="button" onClick={() => predictions(t)} disabled={!ts.length}><Icon name="download" size={13} /> Predições</button>
              </div>
            </section>
          )
        })}
      </div>

      <div className="notice"><Icon name="info" /> Relatórios e predições são estimativas de apoio à decisão. Compartilhe apenas com a equipe pedagógica e sem associar códigos a nomes fora do sistema (LGPD).</div>
      <footer className="foot"><span>Dados sintéticos. Métricas, pessoas e resultados do modelo são ilustrativos.</span><span>Farol.IA · FATEC Jacareí</span></footer>
    </main>
  )
}
