# Farol.IA — front-end (ABP 2026-2, FATEC Jacareí)

Aplicação web de Inteligência Educacional (React + Vite + React Router).

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # produção (dist/)
```

## Requisitos da proposta × onde estão

| Requisito | Onde |
|---|---|
| RF01 cadastro de turmas e perfil sociológico (individual e lote CSV) | `src/Cadastro.jsx`, `src/store.jsx` (`importCSV`), página Turmas/Estudantes |
| RF02 predição de nota e risco de defasagem | `predict()`, `classify()`, `pDef()` em `src/data.js` (**regra ilustrativa**, trocar pela API de ML) |
| RF03 painel interativo com filtros (turma, renda, escolaridade, infraestrutura) | `src/pages/Overview.jsx`, `src/pages/Students.jsx`, `src/Filters.jsx` |
| RF04 comparativo com a base histórica do ENEM | gráfico e chips na Visão geral; `ENEM_BASE` em `src/data.js` (**valores ilustrativos**) |
| RF05 download de relatórios e tabelas de predição | CSV em Visão geral, Estudantes e Turmas (`src/utils.js`) |
| RNF04 LGPD | só código pseudonimizado, sem nome/CPF; página Privacidade e dados |

## Próximos passos (backend)
- Treinar/validar o modelo com os microdados do ENEM (RNF03) e preencher as métricas em "Sobre o modelo".
- Expor `POST /predict` (documentado, RNF01) e trocar `predict()` por uma chamada à API.
- Persistir turmas/estudantes no backend (hoje ficam no `localStorage` do navegador).
- Publicar em nuvem (RNF02).
