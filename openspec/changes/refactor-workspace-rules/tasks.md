## 1. Convention sources & template

- [x] 1.1 Update `.cursor/myteam/config.yaml > rules.workspace` to the three-file model (AGENT.md curated doc; `<part>.mdc` rule — leaf=globs, parent=description-only, body @-refs AGENT.md; `progress.txt` append-only log promoted into AGENT.md)
- [x] 1.2 Update `_[name-part]/` template: single `AGENT.md` template + `_[name-part].mdc` template + seeded `progress.txt`; remove its `README.md` and `suggest/`
- [x] 1.3 Update `.cursor/commands/myteam-init.md` scaffolding tree to `_[name-part]/{AGENT.md, _[name-part].mdc, progress.txt}` and adjust the guardrail line

## 2. Top-level workspace docs

- [x] 2.1 Merge `workspace/README.md` (part map + convention) into `workspace/AGENT.md`; delete `README.md`
- [x] 2.2 Add `workspace/workspace.mdc` (description-based repo-wide conventions + part map, `alwaysApply: false`, `@AGENT.md`)

## 3. Refactor each part (merge → AGENT.md, add .mdc, add progress.txt, drop README+suggest)

- [x] 3.1 `_api-gateways/` (globs `ApiGateways/**`)
- [x] 3.2 `_infrastructure/` (globs `Infrastructure/**`)
- [x] 3.3 `_services/` parent (description-only) + `_basket/_catalog/_discount/_ordering/` (globs `Services/<X>/**`)
- [x] 3.4 `_client/` (globs `client/**`)
- [x] 3.5 `_micro-frontends/` parent (description-only) + `_app-injector/_auth-provider/_shared-layout/` (globs `micro-frontends/packages/<pkg>/**`) + `_scripts/` (globs `micro-frontends/{package.json,nx.json}`)
- [x] 3.6 `_deployments/` parent (description-only) + `_helm/_istio/_k8s/_monitoring/` (globs `Deployments/<sub>/**`)
- [x] 3.7 `_monitoring/` (globs `monitoring/**`) and `_diagrams/` (globs `diagrams/**`)
- [x] 3.8 `_terraform/` (globs `terraform/**`) and `_scripts/` (globs `scripts/**`)
- [x] 3.9 `_tests/` parent (description-only) + `_k6/` (globs `tests/k6/**`); `_tools/` (globs `tools/**`)

## 4. Wire the harness to per-part progress

- [x] 4.1 `.cursor/skills/myteam-harness/SKILL.md`: Inputs + step 1 (read part AGENT.md/progress.txt), step 4 (hand them to agents), step 9 (append to part progress.txt too), step 10 (promote part progress→part AGENT.md)
- [x] 4.2 `.cursor/myteam/AGENT.md` condensed loop: mirror steps 1/9/10 for per-part progress
- [x] 4.3 `.cursor/commands/myteam-run.md` Phase 2: note the per-part read/append (delegating detail to the skill)
- [x] 4.4 `.cursor/commands/myteam-onboard.md`: rewrite approach + steps to produce `AGENT.md` + `.mdc` + seeded `progress.txt`; verify all three and `.mdc` frontmatter
- [x] 4.5 `.cursor/commands/myteam-archive.md` step 4: keep promotion target `AGENT.md`; note part `progress.txt` is a promotion source and is retained

## 5. Verification

- [x] 5.1 `find .cursor/rules/workspace -type f`: each part dir has `AGENT.md` + one `*.mdc` + `progress.txt`; no `README.md`/`suggest/`; template has the three templates
- [x] 5.2 `grep -rn "suggest\|README.md" .cursor/rules .cursor/commands .cursor/myteam .cursor/skills`: no stale references to the removed structure
- [x] 5.3 Validate each `.mdc` frontmatter (YAML block with `description`/`globs`/`alwaysApply`) and spot-check globs resolve (`ls Services/Basket`, `ls Deployments/helm`, …)
- [x] 5.4 `grep -n "progress.txt"` across harness skill, myteam-run, myteam-onboard, myteam/AGENT.md: all reference per-part progress
- [x] 5.5 Read top-level `workspace/AGENT.md`: part map + conventions + cross-cutting present; confirm diff touches only `.cursor/`
