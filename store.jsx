import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { STUDENTS, BASE_TURMAS, SCHOOLS, RENDAS, ESCOLARIDADES, INFRAS, makeStudent } from './data.js'
import { parseCSV, parseLevel, norm } from './utils.js'

// Estado do protótipo: dados sintéticos + o que o gestor cadastra (salvo apenas neste navegador).
const KEY = 'farol-ia:cadastros:v1'
const EMPTY = { students: [], turmas: [], plans: {} }
const Ctx = createContext(null)

function load() {
  try { return { ...EMPTY, ...(JSON.parse(localStorage.getItem(KEY)) || {}) } } catch { return EMPTY }
}
function save(v) {
  try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* armazenamento indisponível */ }
}

export function StoreProvider({ children }) {
  const [custom, setCustom] = useState(load)
  const commit = useCallback((next) => { save(next); setCustom(next) }, [])

  const turmas = useMemo(() => [...BASE_TURMAS, ...custom.turmas], [custom.turmas])
  const students = useMemo(() => {
    const all = [...STUDENTS, ...custom.students]
    return all.map((s) => (custom.plans[s.id] ? { ...s, hasPlan: true } : s))
  }, [custom])

  const addTurma = (ident, turno) => {
    const nome = `3ª ${ident.trim().toUpperCase()}`
    if (!ident.trim()) return { error: 'Informe o identificador da turma.' }
    if (turmas.some((t) => norm(t.nome) === norm(nome))) return { error: `A turma ${nome} já existe.` }
    commit({ ...custom, turmas: [...custom.turmas, { nome, turno, custom: true }] })
    return { turma: nome }
  }

  const buildStudents = (inputs) => {
    let n = STUDENTS.length + custom.students.length
    return inputs.map((i) => makeStudent({ ...i, id: 'E-' + String(++n).padStart(4, '0') }))
  }
  const addStudents = (inputs) => {
    const created = buildStudents(inputs)
    commit({ ...custom, students: [...custom.students, ...created] })
    return created
  }

  // Importação em lote (RF01): colunas turma, escola, renda, escolaridade, infraestrutura, frequencia.
  const importCSV = (text) => {
    const rows = parseCSV(text)
    if (rows.length < 2) return { added: 0, errors: ['Arquivo vazio ou sem linhas de dados.'] }
    const head = rows[0].map(norm)
    const col = (name) => head.findIndex((h) => h.startsWith(name))
    const idx = { turma: col('turma'), escola: col('escola'), renda: col('renda'), esc: col('escolaridade'), infra: col('infra'), freq: col('frequencia') }
    const missing = Object.entries(idx).filter(([, v]) => v < 0).map(([k]) => k)
    if (missing.length) return { added: 0, errors: [`Colunas ausentes: ${missing.join(', ')}. Use o modelo de CSV.`] }
    const inputs = [], errors = []
    rows.slice(1).forEach((r, i) => {
      const line = i + 2
      const turma = turmas.find((t) => norm(t.nome) === norm(r[idx.turma]))
      const school = SCHOOLS.find((s) => norm(s) === norm(r[idx.escola]) || norm(s) === norm('Escola ' + r[idx.escola]))
      const renda = parseLevel(r[idx.renda], RENDAS)
      const esc = parseLevel(r[idx.esc], ESCOLARIDADES)
      const infra = parseLevel(r[idx.infra], INFRAS)
      const freq = Math.round(parseFloat(String(r[idx.freq]).replace(',', '.')))
      const bad = []
      if (!turma) bad.push('turma')
      if (!school) bad.push('escola')
      if (renda < 0) bad.push('renda')
      if (esc < 0) bad.push('escolaridade')
      if (infra < 0) bad.push('infraestrutura')
      if (!(freq >= 0 && freq <= 100)) bad.push('frequência')
      if (bad.length) errors.push(`Linha ${line}: valor inválido em ${bad.join(', ')}.`)
      else inputs.push({ school, turma: turma.nome, shift: turma.turno, freq, renda, esc, infra })
    })
    if (inputs.length) addStudents(inputs)
    return { added: inputs.length, errors }
  }

  const setPlan = (id, plan) => commit({ ...custom, plans: { ...custom.plans, [id]: plan } })
  const resetCustom = () => commit(EMPTY)

  const value = { students, turmas, plans: custom.plans, customCount: custom.students.length, customTurmas: custom.turmas.length,
    addTurma, addStudents, importCSV, setPlan, resetCustom }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
