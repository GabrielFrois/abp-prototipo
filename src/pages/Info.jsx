import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'

const Foot = () => (
  <footer className="foot"><span>Dados sintéticos. Métricas, pessoas e resultados do modelo são ilustrativos.</span><span>Farol.IA · FATEC Jacareí</span></footer>
)

export function Modelo() {
  const metrics = [['MAE (erro absoluto médio)'], ['RMSE'], ['R²'], ['Acurácia / AUC da classificação de defasagem']]
  return (
    <main className="page doc">
      <div className="eyebrow">TRANSPARÊNCIA</div>
      <h1>Sobre o modelo</h1>
      <p className="sub">Como a estimativa de desempenho e o risco de defasagem são produzidos, e o que ainda é ilustrativo neste protótipo.</p>

      <section className="card">
        <h3>Pipeline previsto (RF02 e RNF03)</h3>
        <ol className="steps">
          <li><b>Microdados do ENEM (Kaggle).</b> Notas por área e questionário socioeconômico, tratados e anonimizados.</li>
          <li><b>Treinamento e validação.</b> Regressão para a nota e classificação para a probabilidade de defasagem, com separação treino/teste.</li>
          <li><b>API de processamento.</b> Recebe o perfil sociológico do estudante cadastrado e devolve nota estimada, faixa e probabilidade.</li>
          <li><b>Aplicação web.</b> Mostra os resultados ao gestor, com filtros, comparativo com a base e relatórios para download.</li>
        </ol>
      </section>

      <section className="card">
        <h3>Estado atual deste protótipo</h3>
        <p className="muted">
          O front-end usa uma <b>regra linear ilustrativa</b> (renda, escolaridade familiar e infraestrutura domiciliar) no lugar do modelo treinado.
          Ela fica isolada em <code>predict()</code> no arquivo <code>src/data.js</code> e deve ser trocada por uma chamada à API quando o modelo estiver implantado.
          As médias de referência do ENEM usadas no comparativo (RF04) também são ilustrativas até que a base tratada esteja disponível.
        </p>
        <p className="muted">Risco: <b>Elevado</b> quando a nota estimada é ≤ 530 ou a frequência é &lt; 75%; <b>Atenção</b> quando ≤ 575 ou frequência &lt; 85%; caso contrário, <b>Menor</b>.</p>
      </section>

      <section className="card">
        <h3>Métricas de validação (a preencher após o treinamento)</h3>
        <table className="mini-table">
          <thead><tr><th>Métrica</th><th>Resultado</th></tr></thead>
          <tbody>{metrics.map(([m]) => <tr key={m}><td>{m}</td><td className="muted">pendente — não medido</td></tr>)}</tbody>
        </table>
        <p className="muted small">Nenhuma métrica é exibida porque o modelo real ainda não foi treinado. Não use estes números como evidência de acurácia.</p>
      </section>

      <section className="card">
        <h3>Limites</h3>
        <ul className="bullets">
          <li>Correlação entre perfil e nota não é causalidade; barreiras sociais não indicam falta de potencial.</li>
          <li>A estimativa não substitui a avaliação pedagógica nem a escuta do estudante.</li>
          <li>Modelos treinados em dados históricos podem reproduzir desigualdades; revise os resultados por grupo.</li>
        </ul>
      </section>
      <p><Link className="link" to="/">← Voltar para Visão geral</Link></p>
      <Foot />
    </main>
  )
}

export function Privacidade() {
  const { customCount, customTurmas, resetCustom } = useStore()
  const clear = () => {
    if (window.confirm('Apagar as turmas, estudantes e planos cadastrados neste navegador?')) resetCustom()
  }
  return (
    <main className="page doc">
      <div className="eyebrow">TRANSPARÊNCIA</div>
      <h1>Privacidade e dados</h1>
      <p className="sub">Como o Farol.IA trata dados, em linha com a Lei Geral de Proteção de Dados Pessoais (RNF04).</p>

      <section className="card">
        <h3>O que é coletado</h3>
        <ul className="bullets">
          <li>Turma, escola, faixa de renda, escolaridade familiar, infraestrutura domiciliar e frequência recente.</li>
          <li>Cada estudante é identificado apenas por um código (ex.: E-0248). <b>Nome, CPF e contatos não são coletados.</b></li>
        </ul>
      </section>
      <section className="card">
        <h3>Princípios aplicados</h3>
        <ul className="bullets">
          <li><b>Minimização e finalidade:</b> somente o necessário para priorizar apoio pedagógico.</li>
          <li><b>Pseudonimização:</b> a ligação entre código e pessoa fica com a escola, fora do sistema.</li>
          <li><b>Transparência:</b> toda estimativa é exibida como ilustrativa, com faixa de incerteza.</li>
          <li><b>Segurança:</b> na versão em nuvem, acesso autenticado e tráfego criptografado (a implementar no backend).</li>
        </ul>
      </section>
      <section className="card">
        <h3>Neste protótipo</h3>
        <p className="muted">
          Os dados são sintéticos. O que você cadastra fica salvo apenas neste navegador (armazenamento local) e não é enviado a nenhum servidor.
          Atualmente: <b>{customCount}</b> estudante(s) e <b>{customTurmas}</b> turma(s) cadastrados por você.
        </p>
        <div><button type="button" className="btn" onClick={clear}>Apagar dados cadastrados</button></div>
      </section>
      <p><Link className="link" to="/">← Voltar para Visão geral</Link></p>
      <Foot />
    </main>
  )
}
