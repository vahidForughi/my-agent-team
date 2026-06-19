---
name: k6
description: k6 load/stress/spike/soak and end-to-end workflow tests for the backend services and the API gateway.
paths:
  - tests/k6/**/*
metadata: { part-dir: tests/k6 }
---
The `k6` skill provides comprehensive guidance for understanding, running, and configuring the k6 load and performance tests. It covers test script structure, configuration management, execution via shell scripts, and integration with Prometheus and Grafana for metrics visualization.

@tests/k6/AGENT.md