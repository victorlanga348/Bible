# S00 — Relatório de validação

## Estado atual de encerramento — 2026-10-20
STATUS ATUAL: DONE. Relatório, encerramento documental e commit aprovados pelo «sim» do utilizador, em resposta ao pedido final de aprovação após a apresentação do relatório.
Commit principal: `74d8b6ca685cc99271c803d931c2ac371d99e0a9` — `chore(sprint-00): establish backend governance`, 134 documentos, 2585 inserções e 1818 remoções. Branch feat/biblia-backend. S01, push e merge continuam sem autorização.
A validação de 194 documentos/799 links foi repetida antes desta atualização e passou sem erros. Abaixo preserva-se o relatório apresentado em REVIEW, incluindo os campos PENDING e as condições específicas do seu verificador pré-encerramento. Esses campos são o retrato aprovado, não o estado atual acima.
Após a aprovação, apenas estados de encerramento e registo de Git/MegaBrain mudam; não há nova funcionalidade ou execução de S01. A verificação específica do encerramento consta no fim deste documento.

## Relatório apresentado e aprovado — retrato histórico

SPRINT: 00 — Governança e Planeamento
BRANCH: feat/biblia-backend
STATUS: REVIEW — execução documental validada; encerramento/commit aguardam aprovação.
Data: 2026-10-20. Ambiente: Windows/PowerShell, Python 3.14.5, RTK e Git existentes.
Base/HEAD: d1d25b7f509ee7b887d53f945550d3f8c2a957d3. Commit: PENDING.

## Implementação
Concluídas documentalmente: governança/AGENTS/GEMINI, políticas TDD/testes/gates, monólito e seis módulos/ADR-0003, nove sprints S00–S08 e cinco artefactos por sprint, IDs/histórico/dependências, ações externas, PLAN S01 e contexto MegaBrain.
Pendente: aprovação do encerramento/commit de S00. Backend e S01 não iniciados; sem aplicação, package.json, schema, migração, corpus ou serviço criado.
As quatro specs, ADR-0001/0002, DOC-0001/S00-T001 e retrospectiva anterior de S00 foram preservados byte a byte. Frontend adiado/S09 histórico; nenhum ID antigo foi reciclado.

## Validação executada e aplicabilidade
| Verificação | Estado | Aplicabilidade e evidência |
|---|---|---|
| Estrutura, links e navegação Markdown | PASS | Validação Python real, incluindo ficheiros novos |
| Artefactos, IDs, estados, dependências e DAG | PASS | Nove sprints/45 artefactos, 41 tarefas ativas e histórico de 28 tarefas |
| Preservação histórica | PASS | Nove hashes SHA-256 comparados à baseline recolhida antes de editar |
| Políticas/arquitetura documental | PASS | Seis módulos, sete gates, limiares e revisão do diff normativo |
| Ações externas e plano S01 | PASS | Seis ações com 11 campos; S01 explícita como não iniciada |
| Inspeção de padrões de segredos e escopo | PASS | Sem candidatos nos padrões inspecionados; só Markdown do escopo alterado |
| Git/diff | PASS | Branch/HEAD/main local preservados; diff check exit 0; sem commit/merge/push |
| Unit Tests | NOT_RUN | Não aplicável à documentação pura; sem comportamento de aplicação |
| Integration Tests | NOT_RUN | Não aplicável à entrega documental; nenhuma aplicação/banco afetado |
| E2E Tests | NOT_RUN | Não aplicável, sem aplicação HTTP |
| TypeScript | NOT_RUN | Não aplicável, sem código/configuração TS/package.json |
| ESLint/build | NOT_RUN | Não aplicável, sem código ou scripts de aplicação |
| Line Coverage | NOT_RUN | Não medida; mínimo futuro >=90%; sem código próprio a medir |
| Branch Coverage | NOT_RUN | Não medida; mínimo futuro >=85%; sem código próprio a medir |
| Mutation Score | NOT_RUN | Não medido; mínimo bruto futuro >85%; sem mutantes válidos/código nesta entrega |
| Migrações reais | NOT_RUN | Não aplicável à S00; schema/migração inexistentes |
| Integração/avaliação de IA | NOT_RUN | Não aplicável à S00; sem geração, adapter ou corpus |

Não aplicabilidade é motivo da entrega documental, não aprovação de suites. Serviço/credencial obrigatório indisponível na futura sprint afetada será BLOCKED; a ausência de banco não é usada para dispensar a integração obrigatória de S01.
RED/GREEN/REFACTOR: não aplicável à documentação, com revisão e checks reais em substituição; nenhuma alteração de comportamento executável. Preparação de verificadores documentais não é implementação de backend.
Mutantes sobreviventes, contagens e relatórios Stryker: inexistentes, sem execução/score alegados. Limiares não foram reduzidos.

## Resultado dos sete gates
| Gate | Resultado | Evidência/motivo |
|---|---|---|
| 1 — Spec/escopo/plano | APROVADO | «ok» explícito do utilizador ao PLAN S00 e seis tarefas documentais |
| 2 — TDD | NÃO APLICÁVEL | Documentação pura; nenhum comportamento executável alterado |
| 3 — Estática/build | NÃO APLICÁVEL | Sem TypeScript/configuração/aplicação; Markdown/diff verificados no Gate 7 |
| 4 — Integração | NÃO APLICÁVEL | Sem aplicação, migração ou adapter nesta entrega; EXT-002 continua pendente para S01 |
| 5 — Mutação | NÃO APLICÁVEL | Sem código mutável nesta entrega; nenhum score alegado |
| 6 — IA | NÃO APLICÁVEL | Sem chamada/geração/corpus; nenhum teste de fornecedor ou avaliação alegado |
| 7 — Governança | APROVADO | Checks documentais reais, critérios, histórico, relatórios e contexto sincronizados |

Não há gate obrigatório da entrega documental pendente/falhado. A aprovação humana de encerramento/commit permanece pendente e a sprint permanece REVIEW.

## Critérios de aceitação
| Critério | Estado | Prova |
|---|---|---|
| AC-001 | PASS | Refs/HEAD/branch, ausência de novos commits; main remota conferida |
| AC-002 | PASS | Inspeção de AGENTS/GEMINI/governança, trilhas e aprovações |
| AC-003 | PASS | Seis módulos, revisão de limites, ADR-0003 e hashes históricos |
| AC-004 | PASS | Artefactos/IDs/grafo e correspondência das 28 linhas históricas |
| AC-005 | PASS | Sete gates, limiares exatos, infra real e bloqueios explícitos |
| AC-006 | PASS | EXT-001 a EXT-006 completas, estado real revisto e scanner sem candidatos |
| AC-007 | PASS | PLAN S01 detalhado e ausência de código/package.json/schema |
| AC-008 | PASS | Links/diff/relatórios/contexto e revisão final |

Fonte canónica dos critérios: [ACCEPTANCE_CRITERIA](ACCEPTANCE_CRITERIA.md). PASS significa aceitação documental verificada, sem aprovação humana de encerramento antecipada.

## Comandos, ambiente, resultados e problemas observados
Todos executados no repositório local, Windows/PowerShell, em 2026-10-20. Scripts de edição/validação temporários fora do repositório não são dependências do backend; código da validação final incorporado abaixo.

| Execução | Resultado |
|---|---|
| Inspeção RTK Git status/branch/remote/log e leituras UTF-8 normativas | Árvore com apenas PLAN S00 não versionado no início da execução aprovada; branch correta |
| `rtk git ls-remote --symref origin HEAD refs/heads/main refs/heads/feat/biblia-backend` | Exit 0; main em d1d25b7; nenhuma branch backend publicada |
| Verificação inline Python por RTK em T002 | Exit 0: sete gates, limites, branch, trilhas e mensagens prescritas |
| Verificação inline Python por RTK em T003 | Exit 0: seis módulos e dois hashes ADR preservados |
| `rtk proxy python C:/Users/victo/AppData/Local/Temp/bible_s00_roadmap.py` | Exit 0: edição documental, 28 tarefas históricas preservadas e 34 futuras novas; verificação real na linha seguinte |
| Verificação inline Python por RTK em T004 | Exit 0: 9 sprints, 45 artefactos, 41 tarefas, 28 históricas, 777 links relativos e sem ciclos/erros |
| Verificação inline Python por RTK em T005 | Exit 0: 6 ações e 11 campos por ação |
| Verificação inline Python por RTK em T006 | Exit 0: 15 marcadores do PLAN S01 e nenhum ficheiro não documental na raiz |
| `rtk proxy python C:/Users/victo/AppData/Local/Temp/bible_s00_validate.py` | Primeira passagem transversal exit 0: 194 documentos, 799 links, 9 hashes, zero erros/candidatos; T007 ainda IN_PROGRESS |
| Comando reproduzível abaixo, após sincronização final | Resultado final arquivado abaixo, sem depender dos ficheiros temporários |
| `rtk git diff --check` e checks Git do verificador | Exit 0; avisos LF/CRLF do Git não são erros de whitespace; configuração global não alterada |

Comandos inline de validação intermédia foram executados durante as tarefas; o verificador incorporado reproduz os invariantes agregados e acrescenta preservação de estados/relatórios finais. Não pressupõe os scripts temporários de edição para reexecução.
Incidentes de ferramenta: primeira tentativa apply_patch rejeitou operações duplicadas sobre o mesmo caminho sem escrever; corrigida por Update File. Outra tentativa de atualizar índice usou título divergente e foi rejeitada sem escrita; leitura do conteúdo e patch correto resolveram. Não são RED de comportamento nem falhas ocultas de aplicação.
Docker na preparação do plano: cliente instalado, motor Linux indisponível (exit 1); permanece EXT-002 e nenhuma conexão PostgreSQL foi testada. Não foi repetido nem iniciado serviço fora do escopo.
RTK usado nas operações compatíveis; Git nativo para opções específicas/provas do verificador e Python/PowerShell para UTF-8/checks, sem scripts de aplicação inventados.

## Dependências externas e riscos
| ID | Ação necessária | Estado e momento |
|---|---|---|
| EXT-001 | Escolher IA/modelos/embeddings, orçamento e credenciais seguras | ACTION_REQUIRED, S05/S06/S08 |
| EXT-002 | Aprovar/disponibilizar PostgreSQL real isolado | ACTION_REQUIRED, antes da validação S01 |
| EXT-003 | Aprovar cânone/versificação/traduções/licenças | ACTION_REQUIRED, S02 |
| EXT-004 | Aprovar fontes autênticas/corpus/direitos | ACTION_REQUIRED, S03/S05 |
| EXT-005 | Decidir acesso, retenção/eliminação e envio de dados | ACTION_REQUIRED, antes dos dados/exposição/chamadas pertinentes |
| EXT-006 | Escolher ambiente de disponibilização/operação | ACTION_REQUIRED, S08 |

Detalhes e desbloqueio no [registo](../../external-actions/REQUIRED_ACTIONS.md). Nenhuma ação externa bloqueia esta entrega exclusivamente documental.
Riscos: toolchain não comprovada, ambiente indisponível, dados/licenças/modelos e política de acesso por decidir. Checks de links/estrutura não avaliam conteúdo histórico/licenças. Scanner de padrões sem candidatos não prova ausência universal de segredos. Fiscalização de imports ainda não aplicável porque não há código.

## Arquitetura, Git e próximo passo
Conformidade DDD/Hexagonal: verificada documentalmente, sem alegar execução. Dependências indevidas de código: não aplicável, código inexistente. Arquitetura/contratos de implementação detalhados em planos próprios.
Branch feat/biblia-backend, Commit PENDING. Working Tree: alterações documentais aguardando aprovação/commit; nenhuma alteração prévia do utilizador sobrescrita, main local preservada, nenhum merge/push executado.
[REVIEW](REVIEW.md) e [PLAN S01](../S01/PLAN.md). Encerrar/commitar S00 só após aprovação explícita. Iniciar S01 exige nova autorização e contratos técnicos/versões aprovados antes de instalar/codificar.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
Resposta da revisão do agente: não foi identificada mudança do projeto fora da documentação/README; a operação Git e os limites das evidências estão registados.
AGUARDANDO APROVAÇÃO: SIM.

## Reprodução independente da validação
Comando efetivamente executado no estado pré-commit desta entrega:

```powershell
rtk proxy python -c "from pathlib import Path; text=Path('docs/sprints/S00/TEST_REPORT.md').read_text(encoding='utf-8'); exec(text.split(chr(96)*3+'python\n',1)[1].split('\n'+chr(96)*3,1)[0])"
```

Baseline de branch/refs/hashes é intencionalmente específica desta entrega pré-commit; após commit/alterações futuras requer revisão da baseline, preservando este retrato histórico. O verificador inspeciona todos os Markdown e exclui blocos de código da resolução de links.

```python
from pathlib import Path
from urllib.parse import urlsplit, unquote
import subprocess, re, hashlib, json, sys

sys.stdout.reconfigure(encoding='utf-8')
root=Path.cwd()
base='d1d25b7f509ee7b887d53f945550d3f8c2a957d3'
def git(*args):
    return subprocess.check_output(['git',*args],encoding='utf-8',stderr=subprocess.PIPE).strip()
protected={
'docs/tasks/DOC-0001-inicializacao-governanca.md':'367e36a96440fa6fb7a0cef05ca7f7268d2b85571328bafba57f631297faaf7a',
'docs/sprints/S00/tasks/S00-T001-atualizacao-governanca.md':'5968f8f6d3686d3588c39ec963c71697c99110506ceeccc097367adcb5d6c637',
'docs/architecture/adr/ADR-0001-stack-e-limites-arquiteturais.md':'f2ddf6555df9f8343bd65514188c5331d20e1aba0fff2600723ed13691be9bcc',
'docs/architecture/adr/ADR-0002-adocao-condicional-strykerjs.md':'5d9eb8c65421acfbebb4fa4522961692a4c90205540e269bf0c92aba374e2c1c',
'docs/specs/structured-study.md':'114e067fac2877dbae48b3b26ef76ac422061a50cd6749a193c5f2f0f74351bd',
'docs/specs/free-questions.md':'5e23665425d16bfc2284378b671e96ed0fb481078421330589a9cb86458384a2',
'docs/specs/source-retrieval.md':'6b243ef31c6cf0694f0cf6725f6702d93d4b57b579fee29653b25f4d03c050a2',
'docs/specs/study-history.md':'dd608c42c8e5e9a479a38056d8c84d8cd64fd3a85b3accdd476d8492eee262a9',
'docs/sprints/S00/retrospective.md':'08d7ae25ba87e459eec084f16a2ead10975f69d01ce239c6d84a63a96e625ed2'
}
files=sorted(Path('docs').rglob('*.md'))+[Path(n) for n in ['README.md','AGENTS.md','GEMINI.md']]
contents={p.as_posix():p.read_text(encoding='utf-8') for p in files}
errors=[]
fence=chr(96)*3
links=0
for name,text in contents.items():
    if not text.endswith('\n'): errors.append('newline:'+name)
    for number,line in enumerate(text.splitlines(),1):
        if line.rstrip()!=line and name not in protected:
            errors.append('whitespace:'+name+':'+str(number))
    without_code=re.sub(fence+r'.*?'+fence,'',text,flags=re.S)
    for target in re.findall(r'(?<!!)\[[^\]]+\]\(([^)\n]+)\)',without_code):
        parsed=urlsplit(target.strip().strip('<>'))
        if parsed.scheme or not parsed.path: continue
        links+=1
        if not (Path(name).parent/unquote(parsed.path)).is_file(): errors.append('link:'+name+':'+target)

for name,digest in protected.items():
    if hashlib.sha256(Path(name).read_bytes()).hexdigest()!=digest:errors.append('protected:'+name)

states={'BACKLOG','READY','IN_PROGRESS','BLOCKED','REVIEW','DONE'}
tasks={}; counts={s:0 for s in sorted(states)}
for i in range(9):
    s=f'S{i:02}'; folder='docs/sprints/'+s+'/'
    for name in ['PLAN.md','TASKS.md','ACCEPTANCE_CRITERIA.md','TEST_REPORT.md','REVIEW.md']:
        if folder+name not in contents: errors.append('artifact:'+folder+name)
    readme=contents[folder+'README.md']
    for name in ['docs/sprints/README.md','docs/roadmap/master-plan.md']:
        row=next((line for line in contents[name].splitlines() if line.startswith('| ['+s+']')), '')
        match=re.search(r'Estado: (\w+)',readme)
        if not match or '| '+match.group(1)+' |' not in row:errors.append('sprint_state:'+s+':'+name)
    for line in contents[folder+'TASKS.md'].splitlines():
        if not re.match(r'\| S\d{2}-T\d{3} \|',line):continue
        cells=[c.strip() for c in line.split('|')[1:-1]]
        if len(cells)!=7:errors.append('task_fields:'+s);continue
        ident,title,track,priority,state,deps,spec=cells
        if ident in tasks or not ident.startswith(s+'-'):errors.append('task_id:'+ident)
        if state not in states:errors.append('task_state:'+ident)
        else:counts[state]+=1
        if not all([title,track,priority,spec]):errors.append('empty_task:'+ident)
        if i>0 and (int(ident[-3:])<4 or state not in {'BACKLOG','BLOCKED'}):errors.append('future_task:'+ident)
        if state=='BLOCKED' and ('desbloquear' not in contents[folder+'TASKS.md'].lower()):errors.append('blocked_reason:'+ident)
        tasks[ident]={'state':state,'deps':re.findall(r'\bS\d{2}-T\d{3}\b',deps)}
    if i>0 and 'Estado: BACKLOG' not in readme:errors.append('future_sprint:'+s)
    if i>0 and 'NOT_RUN' not in contents[folder+'TEST_REPORT.md']:errors.append('future_report:'+s)

visited=set(); active=set()
def visit(node):
    if node in active:errors.append('cycle:'+node);return
    if node in visited:return
    active.add(node)
    for dep in tasks[node]['deps']:
        if dep not in tasks:errors.append('unknown_dep:'+dep)
        else:visit(dep)
    active.remove(node);visited.add(node)
for ident in tasks:visit(ident)
dep_rows={}
for line in contents['docs/roadmap/dependencies.md'].splitlines():
    if re.match(r'\| S\d{2}-T\d{3} \|',line):
        cells=[c.strip() for c in line.split('|')[1:-1]]
        dep_rows[cells[0]]=re.findall(r'\bS\d{2}-T\d{3}\b',cells[1])
if dep_rows!={n:t['deps'] for n,t in tasks.items()}:errors.append('dependency_map')
if len(tasks)!=41 or counts['IN_PROGRESS']>1:errors.append('task_count_or_parallelism')

legacy=contents['docs/roadmap/HISTORY.md']
legacy_rows=[line for line in legacy.splitlines() if re.match(r'\| S\d{2}-T\d{3} \|',line)]
old_rows=[]
for i in range(10):
    old=git('show',base+':docs/sprints/S'+str(i).zfill(2)+'/backlog.md')
    old_rows += [line.replace('(../../','(../') for line in old.splitlines() if re.match(r'\| S\d{2}-T\d{3} \|',line)]
if sorted(legacy_rows)!=sorted(old_rows) or len(legacy_rows)!=28:errors.append('legacy_preservation')
for n in range(1,12):
    if 'PLAN-'+str(n).zfill(3) not in contents['docs/roadmap/traceability.md']:errors.append('legacy_plan:'+str(n))

for p in Path('docs/sprints/S00/tasks').glob('S00-T*.md'):
    match=re.search(r'S00-T\d{3}',p.name)
    ident=match.group()
    state=re.search(r'^Estado[: ]+([A-Z_]+)',p.read_text(encoding='utf-8'),re.M)
    if not state or state.group(1)!=tasks[ident]['state']:errors.append('task_sheet:'+ident)
    row=next((x for x in contents['docs/sprints/S00/tasks/README.md'].splitlines() if '| ['+ident+']' in x),'')
    if '| '+tasks[ident]['state']+' |' not in row:errors.append('task_index:'+ident)

modules=['biblical-canon','source-library','study','cross-references','ai-assistant','study-workspace']
for m in modules:
    if '| '+m+' |' not in contents['docs/architecture/bounded-contexts.md']:errors.append('module:'+m)
gate=contents['docs/quality/quality-gates.md']
if re.findall(r'^## Gate (\d)',gate,re.M)!=[str(i) for i in range(1,8)]:errors.append('gates')
for phrase in ['Line Coverage >= 90%','Branch Coverage >= 85%','> 85%','BLOCKED','Supertest','Stryker','zero erros']:
    if phrase not in gate:errors.append('gate_requirement:'+phrase)
for s in ['AGENTS.md','docs/documentation-governance.md','docs/sprints/README.md','docs/quality/quality-gates.md']:
    if 'Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?' not in contents[s]:errors.append('closing_question:'+s)

actions=contents['docs/external-actions/REQUIRED_ACTIONS.md']
sections=re.split(r'^## EXT-',actions,flags=re.M)[1:]
fields=['ID:','Componente:','Estado: ACTION_REQUIRED','Sprint afetada:','Ação necessária:','Local:','Variável:','Como obter:','Implementação preparada:','Validação pendente:','Critério de desbloqueio:']
if len(sections)!=6:errors.append('external_action_count')
for i,section in enumerate(sections,1):
    for field in fields:
        if field not in section:errors.append('external_action:'+str(i)+':'+field)

plan1=contents['docs/sprints/S01/PLAN.md']
for phrase in ['RASCUNHO PARA APROVAÇÃO','S01-T004','S01-T009','Contratos a concretizar','RED → GREEN → REFACTOR','PostgreSQL real','Sem push/merge']:
    if phrase not in plan1:errors.append('s01_plan:'+phrase)
dirs=[Path('docs')]+[p for p in Path('docs').rglob('*') if p.is_dir()]
for p in dirs:
    if not (p/'README.md').is_file():errors.append('directory_index:'+p.as_posix())
non_docs=[p.as_posix() for p in Path('docs').rglob('*') if p.is_file() and p.suffix!='.md']
non_docs += [p.as_posix() for p in root.iterdir() if p.is_file() and p.suffix!='.md']
if non_docs:errors.append('unexpected_files:'+str(non_docs))

secret_patterns=[r'gh[pousr]_[A-Za-z0-9]{30,}',r'github_pat_[A-Za-z0-9_]{40,}',r'AKIA[0-9A-Z]{16}',r'\bsk-[A-Za-z0-9_-]{24,}',r'postgres(?:ql)?://[^\s:/]+:[^\s@]+@',r'-----BEGIN '+r'(?:RSA |EC |OPENSSH )?PRIVATE KEY-----']
suspects=[]
for name,text in contents.items():
    if any(re.search(pattern,text) for pattern in secret_patterns):suspects.append(name)
if suspects:errors.append('secret_candidates:'+','.join(suspects))
changed=git('diff','--name-only','HEAD').splitlines()+git('ls-files','--others','--exclude-standard').splitlines()
if any(not p.endswith('.md') or (not p.startswith('docs/') and p not in {'AGENTS.md','GEMINI.md','README.md'}) for p in changed):errors.append('scope')
branch=git('branch','--show-current'); head=git('rev-parse','HEAD'); main=git('rev-parse','main')
if branch!='feat/biblia-backend' or head!=base or main!='593833e0561e161dc689725ac4d36ef04c280d04':errors.append('git_refs')
diff=subprocess.run(['git','diff','--check'],capture_output=True,text=True)
if diff.returncode:errors.append('diff_check:'+diff.stdout+diff.stderr)
if tasks['S00-T007']['state']=='DONE':
    if 'Estado: REVIEW' not in contents['docs/sprints/S00/README.md']:errors.append('s00_not_review')
    if 'STATUS: REVIEW' not in contents['docs/sprints/S00/TEST_REPORT.md']:errors.append('report_not_review')
    if 'Commit: PENDING' not in contents['docs/sprints/S00/REVIEW.md']:errors.append('commit_status')
    for n in range(1,9):
        line=next((x for x in contents['docs/sprints/S00/ACCEPTANCE_CRITERIA.md'].splitlines() if x.startswith('| AC-'+str(n).zfill(3)+' |')), '')
        if '| PASS |' not in line:errors.append('acceptance_result:'+str(n))
result={'date':'2026-10-20','environment':'Windows/PowerShell/Python','branch':branch,'head':head,'main_unchanged':main,'markdown_files':len(files),'relative_links_checked':links,'sprints':9,'required_artifacts':45,'active_tasks':len(tasks),'task_states':counts,'legacy_tasks_preserved':len(legacy_rows),'protected_hashes_verified':len(protected),'modules':6,'external_actions':len(sections),'secret_scan_files':len(files),'secret_candidates':len(suspects),'modified_tracked_documents':len(git('diff','--name-only','HEAD').splitlines()),'new_documents':len(git('ls-files','--others','--exclude-standard').splitlines()),'application_tests_run':False,'errors':errors}
print(json.dumps(result,ensure_ascii=True,indent=2))
sys.exit(1 if errors else 0)
```

## Saída da passagem final

```json
{
  "date": "2026-10-20",
  "environment": "Windows/PowerShell/Python",
  "branch": "feat/biblia-backend",
  "head": "d1d25b7f509ee7b887d53f945550d3f8c2a957d3",
  "main_unchanged": "593833e0561e161dc689725ac4d36ef04c280d04",
  "markdown_files": 194,
  "relative_links_checked": 799,
  "sprints": 9,
  "required_artifacts": 45,
  "active_tasks": 41,
  "task_states": {
    "BACKLOG": 8,
    "BLOCKED": 26,
    "DONE": 7,
    "IN_PROGRESS": 0,
    "READY": 0,
    "REVIEW": 0
  },
  "legacy_tasks_preserved": 28,
  "protected_hashes_verified": 9,
  "modules": 6,
  "external_actions": 6,
  "secret_scan_files": 194,
  "secret_candidates": 0,
  "modified_tracked_documents": 79,
  "new_documents": 55,
  "application_tests_run": false,
  "errors": []
}
```

## Verificação do encerramento aprovado

Em 2026-10-20 o utilizador aprovou o relatório, o encerramento e o commit com «sim». Estados S00/índices/README/REVIEW/MegaBrain sincronizados para DONE. O verificador histórico acima permanece intacto; o seguinte verifica a transição aprovada, sem reduzir gates de comportamento ou alterar hashes históricos.
Comando executado para esta atualização documental:

```powershell
rtk proxy python -c "from pathlib import Path; text=Path('docs/sprints/S00/TEST_REPORT.md').read_text(encoding='utf-8'); exec(text.rsplit(chr(96)*3+'python\n',1)[1].split('\n'+chr(96)*3,1)[0])"
```

```python
from pathlib import Path
from urllib.parse import urlsplit,unquote
import ast,hashlib,json,re,subprocess,sys

sys.stdout.reconfigure(encoding='utf-8')
def git(*args):
    return subprocess.check_output(['git',*args],text=True,encoding='utf-8',stderr=subprocess.PIPE).strip()
report=Path('docs/sprints/S00/TEST_REPORT.md').read_text(encoding='utf-8')
fence=chr(96)*3
snapshot=report.split(fence+'python\n',1)[1].split('\n'+fence,1)[0]
tree=ast.parse(snapshot)
protected=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='protected' for t in n.targets))
files=sorted(Path('docs').rglob('*.md'))+[Path(n) for n in ['AGENTS.md','GEMINI.md','README.md']]
errors=[];links=0
for p in files:
    text=p.read_text(encoding='utf-8')
    for target in re.findall(r'(?<!!)\[[^\]]+\]\(([^)\n]+)\)',re.sub(fence+r'.*?'+fence,'',text,flags=re.S)):
        parsed=urlsplit(target)
        if parsed.scheme or not parsed.path:continue
        links+=1
        if not (p.parent/unquote(parsed.path)).is_file():errors.append('link:'+p.as_posix()+':'+target)
    if any(line.rstrip()!=line for line in text.splitlines()) and p.as_posix() not in protected:errors.append('whitespace:'+p.as_posix())
    for pattern in [r'gh[pousr]_[A-Za-z0-9]{30,}',r'github_pat_[A-Za-z0-9_]{40,}',r'AKIA[0-9A-Z]{16}',r'\bsk-[A-Za-z0-9_-]{24,}',r'postgres(?:ql)?://[^\s:/]+:[^\s@]+@']:
        if re.search(pattern,text):errors.append('secret_candidate:'+p.as_posix())
for name,digest in protected.items():
    if hashlib.sha256(Path(name).read_bytes()).hexdigest()!=digest:errors.append('protected:'+name)
for i in range(9):
    folder=Path('docs/sprints')/f'S{i:02}'
    text=(folder/'README.md').read_text(encoding='utf-8')
    state='DONE' if i==0 else 'BACKLOG'
    if 'Estado: '+state not in text:errors.append('state:'+str(i))
    for n in ['PLAN.md','TASKS.md','ACCEPTANCE_CRITERIA.md','TEST_REPORT.md','REVIEW.md']:
        if not (folder/n).is_file():errors.append('artifact:'+str(i)+':'+n)
for name in ['docs/sprints/README.md','docs/roadmap/master-plan.md']:
    row=next((x for x in Path(name).read_text(encoding='utf-8').splitlines() if x.startswith('| [S00]')),'')
    if '| DONE |' not in row:errors.append('summary:'+name)
for name in ['README.md','docs/README.md','AGENTS.md','docs/megabrain/agent-context/project-state.md']:
    text=Path(name).read_text(encoding='utf-8')
    if 'DONE' not in text or '«sim»' not in text:errors.append('closure_context:'+name)
if 'STATUS ATUAL: DONE' not in report or '«sim»' not in report:errors.append('report_approval')
if 'Estado: DONE' not in Path('docs/sprints/S00/REVIEW.md').read_text(encoding='utf-8'):errors.append('review')
if git('branch','--show-current')!='feat/biblia-backend':errors.append('branch')
if git('rev-parse','main')!='593833e0561e161dc689725ac4d36ef04c280d04':errors.append('main')
context=Path('docs/megabrain/agent-context/project-state.md').read_text(encoding='utf-8')
match=re.search(r'Commit principal: `([0-9a-f]{40})`',context)
primary=match.group(1) if match else None
if primary:
    ancestor=subprocess.run(['git','merge-base','--is-ancestor',primary,'HEAD'],capture_output=True)
    if ancestor.returncode or git('show','-s','--format=%s',primary)!='chore(sprint-00): establish backend governance':errors.append('primary_commit')
elif git('rev-parse','HEAD')!='d1d25b7f509ee7b887d53f945550d3f8c2a957d3':errors.append('unexpected_head')
changes=git('diff','--name-only','HEAD').splitlines()+git('ls-files','--others','--exclude-standard').splitlines()
if any(not p.endswith('.md') or (not p.startswith('docs/') and p not in {'AGENTS.md','GEMINI.md','README.md'}) for p in changes):errors.append('scope')
if any(p.is_file() and p.suffix!='.md' for p in Path('docs').rglob('*')) or Path('package.json').exists():errors.append('non_documentation')
diff=subprocess.run(['git','diff','--check'],capture_output=True,text=True)
if diff.returncode:errors.append('diff_check')
result={'date':'2026-10-20','closure_approved':True,'s00_state':'DONE','s01_state':'BACKLOG','markdown_files':len(files),'relative_links_checked':links,'protected_hashes_verified':len(protected),'primary_commit':primary,'branch':git('branch','--show-current'),'errors':errors}
print(json.dumps(result,ensure_ascii=True,indent=2))
sys.exit(1 if errors else 0)
```

Resultado antes do commit principal:

```json
{
  "date": "2026-10-20",
  "closure_approved": true,
  "s00_state": "DONE",
  "s01_state": "BACKLOG",
  "markdown_files": 194,
  "relative_links_checked": 798,
  "protected_hashes_verified": 9,
  "primary_commit": null,
  "branch": "feat/biblia-backend",
  "errors": []
}
```

## Registo posterior do commit principal

Após aprovação, executados `rtk git add -- AGENTS.md GEMINI.md README.md docs`, `rtk git diff --cached --check` e verificação do manifesto de 134 ficheiros exclusivamente Markdown do escopo: exit 0. Executado `git -c pack.readReverseIndex=false commit -m "chore(sprint-00): establish backend governance"`: exit 0, hash principal indicado acima. `rtk git status --short --branch` confirmou árvore limpa imediatamente após esse commit.
A configuração temporária de leitura do índice reverso preserva o contorno operacional já documentado, sem mudar configuração global. Main local/remota preservadas; nenhum merge/push executado.
Esta atualização adicional só regista o hash no PLAN/README/REVIEW/TEST_REPORT e MegaBrain; sem execução da S01. O hash do commit deste registo constará no histórico Git, evitando autorreferência infinita. Verificação pelo último bloco Python do documento, com o mesmo comando de encerramento acima:

```json
{
  "date": "2026-10-20",
  "closure_approved": true,
  "s00_state": "DONE",
  "s01_state": "BACKLOG",
  "markdown_files": 194,
  "relative_links_checked": 798,
  "protected_hashes_verified": 9,
  "primary_commit": "74d8b6ca685cc99271c803d931c2ac371d99e0a9",
  "branch": "feat/biblia-backend",
  "errors": []
}
```
