---
name: diagrams
description: View, add, and maintain Eraser.io architecture diagrams and their rendered image exports for the cloud-native e-commerce platform.
paths:
  - diagrams/**/*
metadata:
  part-dir: diagrams
---

# diagrams skill

## What this part is

The `diagrams/` directory is the canonical visual documentation layer for the platform. It holds **33 `.eraserdiagram` source files** authored in the Eraser.io diagram-as-code format, plus `README.md`. Rendered raster exports live in the repo-root `images/` directory (currently `system-architecture.png` and `dependencies-structure.png`).

## When to invoke this skill

Invoke this skill when a task involves:
- Reading or understanding any `.eraserdiagram` source file in `diagrams/`
- Adding a new diagram to the repository
- Updating a diagram after an architecture change
- Exporting / refreshing a rendered image in `images/`
- Answering questions about which diagrams exist and what each covers
- Keeping `diagrams/` (source) and `images/` (rendered exports) in sync

## Diagram inventory by category

| Category | Files (prefix / suffix) |
|---|---|
| System / topology | `system-architecture`, `architecture`, `deployment-architecture`, `network-architecture`, `kubernetes-topology`, `aws-cloud-deployment`, `context-interaction` |
| Patterns / flows | `cqrs-lifecycle`, `event-driven-architecture`, `saga-checkout`, `data-consistency-flow`, `grpc-discount-flow`, `add-to-cart-flow`, `checkout-synchronous-phase`, `checkout-asynchronous-phase`, `checkout-event-flow`, `sidecar-pattern` |
| Clean architecture | `clean-architecture-layers`, `clean-architecture-implementation`, `clean-architecture-catalog`, `clean-architecture-ordering`, `ordering-erd` |
| Micro-frontends | `module-federation-composition`, `mfe-runtime-composition`, `mfe-migration-timeline`, `store-mfe-flow`, `routing-delegation`, `legacy-angular-spa` |
| Observability / CI-CD | `observability-telemetry-flow`, `cicd-pipeline-flow`, `appendix-cicd-pipeline-stages`, `appendix-distributed-trace-checkout` |

## Key facts

- **Format**: Eraser.io proprietary `.eraserdiagram` — viewable and editable only in the [Eraser.io web editor](https://app.eraser.io). Do not attempt to parse or generate these files as plain text or Markdown.
- **Naming convention**: `<topic>-<aspect>.eraserdiagram` — one concept per file.
- **Rendered exports**: `images/` at repo root; currently only two files are exported. Most diagrams have no rendered image yet.
- **No build pipeline**: Export to `images/` is performed manually from Eraser.io.
- **No config, env vars, or runtime**: This part is pure documentation/assets with no executable code.

## Owners

- `software-architect` — architectural correctness of diagram content
- `technical-writer` — clarity, naming, and keeping rendered images in sync with docs

## Do / Don't

**Do:**
- Name new diagrams `<topic>-<aspect>.eraserdiagram` and place them in `diagrams/`.
- Update both the source `.eraserdiagram` file and its rendered image in `images/` together when architecture changes.
- Reference `diagrams/README.md` for the human-readable index of all diagrams.

**Don't:**
- Parse or auto-generate `.eraserdiagram` files as plain text or Markdown — they render only in Eraser.io.
- Update only the source without refreshing the rendered image (or vice versa) — stale images mislead readers.
- Place rendered images inside `diagrams/`; exports belong in the repo-root `images/` directory.

## Quick reference

```bash
# List all diagram source files
ls /Users/vahid/Projects/cloud-native-ecommerce-platform/diagrams/*.eraserdiagram

# View the diagram index
cat /Users/vahid/Projects/cloud-native-ecommerce-platform/diagrams/README.md

# View currently exported images
ls /Users/vahid/Projects/cloud-native-ecommerce-platform/images/
```

@diagrams/AGENT.md
