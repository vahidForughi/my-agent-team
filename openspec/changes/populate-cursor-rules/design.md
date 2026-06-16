## Context

The repo is a multi-stack cloud-native ecommerce platform. `.cursor/rules/workspace/` exists but
holds only scaffolding: top-level placeholder `README.md` (big-picture map, unfilled) and `AGENT.md`,
plus a `_[name-part]/` template containing `README.md`, `AGENT.md`, and `suggest/`. The established
template convention is: each part is a flat `_<part>/` dir directly under `workspace/`, with three
items (`README.md`, `AGENT.md`, `suggest/`).

Three parallel exploration sweeps mapped the repo and gathered grounded facts (paths, tech, commands,
ports) for every part. The user chose a layout that mirrors the actual repo tree with nested sub-parts,
which intentionally diverges from the template's "no deeper nesting" note.

## Goals / Non-Goals

**Goals:**
- Provide accurate, grounded onboarding rules for every part and sub-part of the repo.
- Mirror the root repo structure so the rules tree is predictable and navigable.
- Keep each file concise and factual: purpose, repo path, tech stack, exact build/run/test commands,
  ports/endpoints, plus reusable patterns and gotchas.
- Update the top-level `workspace/README.md` part map and `workspace/AGENT.md` cross-cutting guidance.

**Non-Goals:**
- No application source, build, pipeline, or infrastructure changes.
- No deletion/rewrite of the `_[name-part]/` template (it is preserved as the copyable template).
- Not an exhaustive API reference — link to repo files rather than duplicating their contents.

## Decisions

- **Nested layout mirroring the repo (over flat).** Parent parts (`_services`, `_micro-frontends`,
  `_deployments`, `_tests`) contain nested sub-part dirs (`_basket`, `_helm`, `_k6`, …). Rationale:
  the user explicitly requested "follow root dir structure," and nesting keeps related guidance
  co-located and discoverable. Alternative (flat top-level only, sub-parts as sections) was rejected
  as it buries per-service/per-tool detail and doesn't match the repo's mental model.
- **Three files per part dir** (`README.md`, `AGENT.md`, `suggest/.gitkeep`), reusing the existing
  template structure so the harness conventions stay intact. Parent parts also get their own
  `README.md`/`AGENT.md` summarizing the area and linking to sub-parts.
- **Document the convention change in `workspace/README.md`.** Since nesting diverges from the
  template's note, the top-level README is updated to state the nested convention, keeping the docs
  self-consistent. The `_[name-part]/` template itself is left unchanged.
- **Content grounded in exploration findings.** Each file cites real paths, commands, and ports
  already verified (e.g., gateway `:8010`, Catalog/Mongo `:8000`, micro-frontends `npm run setup`
  then `npm start` on `:4200–4204`, `terraform init/plan/apply`, k6 PushGateway `:9091`).

## Risks / Trade-offs

- [Docs drift out of date as the repo evolves] → Keep entries short and link to source files/commands
  rather than copying large content; `suggest/` dirs capture follow-ups.
- [Nested layout conflicts with the template's "no nesting" note] → Explicitly update
  `workspace/README.md` to document the new nested convention so there is a single source of truth.
- [Inaccurate facts erode trust] → Verification step spot-checks cited paths/commands against the
  actual repo (`find`/`ls`/`grep`) after creation.
- [Large number of small files (~25 dirs × 3)] → Pattern is uniform and mechanical; a single template
  shape is applied per part, reducing per-file effort and inconsistency.
