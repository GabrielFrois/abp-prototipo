import React from 'react'
import { Routes, Route, NavLink, Link, useLocation, Navigate } from 'react-router-dom'
import Overview from './pages/Overview.jsx'
import Students from './pages/Students.jsx'
import StudentDetail from './pages/StudentDetail.jsx'
import { Modelo, Privacidade } from './pages/Info.jsx'
import Turmas from './pages/Turmas.jsx'
import Interventions from './pages/Interventions.jsx'
import { useStore } from './store.jsx'
import Icon from './Icon.jsx'

const TITLES = {
  '/': 'Visão geral',
  '/estudantes': 'Estudantes',
  '/turmas': 'Turmas',
  '/intervencoes': 'Intervenções',
  '/modelo': 'Sobre o modelo',
  '/privacidade': 'Privacidade e dados',
}

function Sidebar() {
  const { students } = useStore()
  const link = ({ isActive }) => 'nav-item' + (isActive ? ' active' : '')
  return (
    <aside className="sidebar">
      <div className="brand"><Icon name="lighthouse" size={22} /> <span>Farol.IA</span></div>
      <button className="network-select" type="button">
        <small>INTELIGÊNCIA EDUCACIONAL</small>
        <strong>Rede demonstrativa <Icon name="updown" size={12} /></strong>
      </button>
      <div className="nav-label">ACOMPANHAMENTO</div>
      <nav>
        <NavLink end to="/" className={link}><Icon name="grid" /> Visão geral</NavLink>
        <NavLink to="/estudantes" className={link}><Icon name="users" /> Estudantes <em>{students.length.toLocaleString('pt-BR')}</em></NavLink>
        <NavLink to="/turmas" className={link}><Icon name="class" /> Turmas</NavLink>
        <NavLink to="/intervencoes" className={link}><Icon name="clipboard" /> Intervenções</NavLink>
      </nav>
      <div className="nav-label">TRANSPARÊNCIA</div>
      <nav>
        <NavLink to="/modelo" className={link}><Icon name="spark" /> Sobre o modelo</NavLink>
        <NavLink to="/privacidade" className={link}><Icon name="shield" /> Privacidade e dados</NavLink>
      </nav>
      <div className="sidebar-spacer" />
      <button className="help" type="button"><Icon name="help" /> Central de ajuda</button>
    </aside>
  )
}

function Topbar() {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  const title = TITLES[pathname === '/' ? '/' : base] || 'Visão geral'
  return (
    <header className="topbar">
      <div className="crumbs">Inteligência educacional <Icon name="chev" size={12} /> <strong>{title}</strong></div>
      <div className="topbar-right">
        <span className="demo"><i /> Dados demonstrativos</span>
        <button className="icon-btn" aria-label="Notificações" type="button"><Icon name="bell" /></button>
        <span className="divider" />
        <span className="user"><b>GE</b> Gestão educacional <Icon name="chevdown" size={12} /></span>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Topbar />
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/estudantes" element={<Students />} />
          <Route path="/estudantes/:id" element={<StudentDetail />} />
          <Route path="/turmas" element={<Turmas />} />
          <Route path="/intervencoes" element={<Interventions />} />
          <Route path="/modelo" element={<Modelo />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
