# diagrams — Architecture Diagrams

## What & why

The platform's architecture and flow diagrams — system architecture, micro-frontend composition,
CQRS / event-driven / saga patterns, checkout flows, clean-architecture layers, Kubernetes/AWS
topology, observability, and CI/CD. They are the canonical visual source of truth for how the
system is structured and how requests/events flow, kept in version control so docs stay aligned
with the code.

## Where it lives

`diagrams/` — **33** `.eraserdiagram` files (Eraser.io format) plus `README.md`. Rendered images
live in the repo-root `images/` directory (currently `system-architecture.png` and
`dependencies-structure.png` are exported there; most diagrams are not yet rendered). Representative
source files:
- System/topology: `system-architecture`, `architecture`, `deployment-architecture`,
  `network-architecture`, `kubernetes-topology`, `aws-cloud-deployment`, `context-interaction`.
- Patterns/flows: `cqrs-lifecycle`, `event-driven-architecture`, `saga-checkout`,
  `data-consistency-flow`, `grpc-discount-flow`, `add-to-cart-flow`, `checkout-synchronous-phase`,
  `checkout-asynchronous-phase`, `checkout-event-flow`, `sidecar-pattern`.
- Clean architecture: `clean-architecture-layers`, `clean-architecture-implementation`,
  `clean-architecture-catalog`, `clean-architecture-ordering`, `ordering-erd`.
- Micro-frontends: `module-federation-composition`, `mfe-runtime-composition`,
  `mfe-migration-timeline`, `store-mfe-flow`, `routing-delegation`, `legacy-angular-spa`.
- Observability/CI-CD: `observability-telemetry-flow`, `cicd-pipeline-flow`,
  `appendix-cicd-pipeline-stages`, `appendix-distributed-trace-checkout`.

## Tech stack

- Eraser.io proprietary `.eraserdiagram` format (diagram-as-code) — **not** Markdown/Mermaid.
  Edited/viewed only in the Eraser.io editor.
- Markdown index (`diagrams/README.md`); rendered raster/vector exports in repo-root `images/`.

## Build / run / test

```bash
ls diagrams/                 # list all 33 .eraserdiagram source files
```

To view/edit: open a `.eraserdiagram` file in the [Eraser.io editor](https://app.eraser.io)
(import it), or view the pre-rendered exports under repo-root `images/`. No build pipeline — export
to `images/` happens manually from Eraser.io.

## Configuration

No config keys, env vars, or build switches. _No automated render/export configuration found in
`diagrams/`_ — rendering is done by hand in Eraser.io.

## Interfaces & contracts

No programmatic contract. The artifact contract is: every concept has one `<topic>-<aspect>.eraserdiagram`
source file in `diagrams/`, paired with a rendered export in `images/`. Consumers are docs/READMEs
that embed the rendered images.

## Data & state

- Source of truth: the `.eraserdiagram` files in `diagrams/`.
- Rendered output (state): exported images in the repo-root `images/` directory (today just
  `system-architecture.png` and `dependencies-structure.png`) — derived artifacts that must be
  regenerated when a source diagram changes.

## Dependencies

- Depends on the Eraser.io web editor to view/edit and to render.
- Rendered images in `images/` are depended on by repository documentation (`README.md` files,
  architecture docs) that embed them.

## Patterns

- One concept per diagram file, with a descriptive `<topic>-<aspect>.eraserdiagram` name
  (`diagrams/README.md`); follow that naming when adding diagrams.
- When architecture changes, update the source diagram **and** its rendered image in `images/`
  together so they don't drift.

## Gotchas

- Files are the proprietary Eraser.io `.eraserdiagram` format — they render only in Eraser.io;
  don't try to parse or generate them as plain text/markdown in tooling.
- Keep `diagrams/` (source) and `images/` (rendered) in sync; a stale image misleads readers.

## Owners / agents

- `software-architect` — owns architectural correctness of the diagrams.
- `technical-writer` — owns clarity, naming, and keeping rendered images in sync with docs.
