# Auditoria Técnica e Vistoria Conjunta de Projeto — S10-T006

**Data:** 2026-10-31
**Contexto:** S10-T006 (Vistoria conjunta Codex / agy)
**Referência:** [`T006_REVIEW_PLAN.md`](../sprints/S10/T006_REVIEW_PLAN.md)
**Branch:** `feat/biblia-integracao` (HEAD `855de77`)
**Estado:** `IN_PROGRESS` (Fontes em modificação ativa por Codex; conclusão condicionada aos gates de fecho)

Diagnóstico histórico. Retoma de 2026-11-06 e resultados atuais em [T006_TEST_REPORT](../sprints/S10/T006_TEST_REPORT.md); [guia específico do utilizador](../operations/USER_ACTIONS.md). As falhas abaixo foram observadas na revisão original e não são resultados de uma execução atual.

---

## 1. Provas Técnicas Atuais

* **Build Frontend:** `PASS` (Compilação sem erros).
* **Linting:** 0 erros, 5 avisos.
* **Arquitetura Backend:** 9/9 `PASS` (Limites modulares e regras de dependência preservados).
* **Execução Global de Testes:** 194 testes executados — **192 PASS / 2 FAIL**:
  - `context-panel-notes.spec.tsx` (FAIL): Teste herdado falha porque a interface atual do painel de notas é meramente informativa.
  - `persisted-study-flow.spec.tsx` (FAIL por timeout na suite global): Executado isoladamente obtém **6/6 PASS**, sem causa definitiva atribuída (suscetível a contenção de recursos na execução paralela/concorrente).
* **Métrica de Cobertura vs. Execução:** A execução via `coverage:session` executa a suite de testes completa, porém a configuração atual mede e gera relatório de cobertura apenas sobre um recorte de 11 ficheiros da sessão, não refletindo o inventário global de componentes e hooks da adenda T003.

---

## 2. Lacunas Confirmadas

1. **Conversas Persistidas sem UI:** Endpoints e contratos existem no backend, mas falta interface no frontend para listagem, seleção e retomada de conversas persistidas.
2. **Painel de Notas Informativo:** Interface de notas atual não implementa edição e persistência de anotações no contexto de estudo.
3. **Desacoplamento de Cross-References:** O acionamento de referências cruzadas comuta a aba ativa, mas não atualiza a referência bíblica ativa no leitor.
4. **Ocultação em Dispositivos Móveis:** Painel auxiliar/contextual inacessível ou oculto em layouts mobile.
5. **Condições de Corrida e Cancelamento:** Ausência de descarte determinístico de respostas tardias e controle de cancelamento (`AbortController`) ao alternar ou cancelar estudos ativos.
6. **Escopo de Mutação Frontend:** Configuração do Stryker no frontend restrita a 11 fontes de sessão, em desacordo com a adenda T003 que exige inventário global.
7. **Documentação e Evidências:** Documentação em `/docs` e relatórios de sprint desatualizados face à revisão em curso da S10.

---

## 3. Divisão de Trabalho (Codex / agy)

* **Codex (Código, UX, Testes e CI):**
  - Implementação via TDD estrito dos percursos incompletos: propagação da referência ao leitor, persistência de notas, UI de conversas persistidas, controlo de cancelamento/corridas, paginação e CAS no workspace, e responsividade mobile/acessibilidade.
  - Adequação dos testes afetados (resolução da falha em notas e estabilização de timeouts).
  - Execução e configuração dos gates de CI (cobertura global e mutação global no pipeline).
* **agy (Documentação e Auditoria Independente):**
  - Auditoria independente de especificações, conformidade de contratos e integridade documental.
  - Atualização dos artefatos normativos e relatórios de sprint (`T006_TEST_REPORT.md`, `/docs`, `README.md`) sem sobreposição de escrita com o código de implementação.

---

## 4. Critérios de Fecho (Gates Obrigatórios)

Para transição do estado para `DONE` em S10-T006, é mandatória a comprovação das seguintes evidências:

1. **Funcionalidades da Adenda T003:** Todos os percursos acessíveis, responsivos (desktop e mobile) e devidamente persistidos.
2. **Robustez de Concorrência:** Isolamento de estado, validação otimista/CAS e descarte de respostas tardias validados por testes.
3. **Suite Global 100% Verde:** Zero falhas e zero timeouts na suite de testes completa.
4. **Ambiente Real:** Validação de ponta a ponta com PostgreSQL de teste real identificado e sem doubles permanentes de infraestrutura.
5. **Cobertura Global de Código:** Linhas >= 90% e Branches >= 85% sobre todo o código do frontend e backend aplicável.
6. **Teste de Mutação Global:** Stryker Mutation Score bruto > 85% sobre o inventário global no CI (sem atalhos, sem dispensas e sem exclusão indevida de módulos).
7. **Sincronização Documental:** `/docs` e `README.md` integralmente alinhados com a revisão efetiva do repositório.

---

## 5. Ações Exclusivas do Utilizador e Itens Adiados

* **Login Pessoal com Conta Google Humana:** Permanece explicitamente adiado a critério do utilizador para validação manual posterior; não constitui novo bloqueio nem requer credenciais imediatas no ambiente.
* **Aprovação de Conclusão:** Validação final e encerramento da sprint após apresentação do relatório com todos os gates comprovados.
* **Restrições Vigentes:** Preservação estrita das branches `main`, segredos, ausência de publicação externa ou contratação de serviços pagos.
