# Codebase Orientation Map — Tests (Parent)

## 1-Line Summary

The `tests/` directory is the repo-level performance testing area, containing exclusively k6 load/performance test suites targeting the platform's backend services and API gateway.

## 5-Minute Explanation

- **Primary tasks in code**: Organizing and scoping performance/load testing for the platform. Today this directory contains one real subdirectory: `tests/k6/`. Functional tests (unit/integration for .NET services and micro-frontends) are not located here; they live next to their source code.
- **Primary inputs**: No inputs at this level. All test inputs, environment variables, and configuration belong to `tests/k6/`.
- **Primary outputs**: No artifacts are produced at this level. Results, JSON summaries, and Prometheus metrics are produced by the k6 child.
- **Key files**: `tests/k6/` (the only subdirectory). `tests/CLAUDE.md` (do/don't rules for this parent). `tests/k6/CLAUDE.md` (the actionable guide for the k6 suite).
- **Main code paths**: None at this level. See `tests/k6/AGENT.md` for the k6 execution path.

## Deep Dive

- **Type**: Test infrastructure parent directory (organizational grouping only).
- **Primary runtime(s)**: N/A at this level. The k6 child runs on k6 (JavaScript) and Bash.
- **Entry points**: None at this level. Entry points are in `tests/k6/`.

## Top-Level Structure

| Path | Purpose | Notes |
|------|---------|-------|
| `tests/k6/` | k6 load/performance test suite | The only child; all performance testing lives here |
| `tests/AGENT.md` | Onboarding doc for the `tests/` parent | This file |
| `tests/CLAUDE.md` | Do/don't rules for the `tests/` parent | Points to k6 child for actionable detail |

## Key Boundaries

- **Presentation**: N/A
- **Application/Domain**: N/A
- **Persistence/External I/O**: None at this level. The k6 child writes JSON summaries to `/tmp/k6-results-<timestamp>/` and pushes metrics to Prometheus via PushGateway.
- **Cross-cutting concerns**: None at this level.

### What belongs here vs. elsewhere

- **Load/performance tests**: `tests/k6/` — the k6 JavaScript scripts and Bash runner scripts.
- **.NET unit/integration tests**: Each .NET service project contains its own xUnit test project; they are built and run with `dotnet test Ecommerce.sln` from the repo root, not from `tests/`.
- **Micro-frontend tests**: NX + Jest (unit) and Playwright (e2e) under `micro-frontends/`; run with `npm test` and `npm run test:e2e` from the `micro-frontends/` root.

### Responsibilities by module

| Module | Responsibility |
|--------|---------------|
| `tests/k6/` | k6 load/stress/spike/soak tests, runner scripts, Prometheus metric push |

### Detailed code flows

1. This parent directory has no code flows of its own.
2. All execution starts in `tests/k6/` — see `tests/k6/AGENT.md` for the full flow.

### How the pieces map together

`tests/` is an organizational grouping. Its single active child, `tests/k6/`, owns all load testing behavior. Functional tests are co-located with the code they exercise (`.NET xUnit` projects per service; `micro-frontends` Jest/Playwright).

### Files inspected

- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/AGENT.md` (prior version)
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/CLAUDE.md`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/AGENT.md`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/CLAUDE.md`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/config.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/catalog-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/basket-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/ordering-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/discount-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/gateway-smoke-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/stress-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/spike-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/soak-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/workflow-shopping.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/workflow-website.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/verify-failures-test.js`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/run-all-tests.sh`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/push-metrics.sh`
- `/Users/vahid/Projects/cloud-native-ecommerce-platform/tests/k6/README.md`
