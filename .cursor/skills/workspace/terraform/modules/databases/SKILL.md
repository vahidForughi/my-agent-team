---
name: databases
description: Guide for managing AWS managed database services (DocumentDB, ElastiCache Redis, RDS PostgreSQL, RDS SQL Server) using Terraform.
metadata: { part-dir: terraform/modules/databases }
---

## Terraform Databases Skill

This skill provides guidance for working with the Terraform module responsible for provisioning AWS managed database services.

### Key files to read first:
- `terraform/modules/databases/main.tf`: Defines all the AWS database resources.
- `terraform/modules/databases/variables.tf`: Contains input variables, including sensitive credentials.
- `terraform/modules/databases/outputs.tf`: Exports the endpoints of the provisioned databases.

### Top patterns:
- Uses `aws_db_subnet_group`, `aws_docdb_subnet_group`, `aws_elasticache_subnet_group` to manage database network placement.
- Provisions DocumentDB for Catalog, ElastiCache Redis for Basket, RDS PostgreSQL for Discount, and RDS SQL Server for Ordering.
- Configures security groups and instance settings based on environment.

### Top gotchas:
- Sensitive variables (passwords) must be handled securely and marked as `sensitive = true`.
- Production environments should have `multi_az = true` and `deletion_protection = true` enabled for RDS instances.
- Database instances should always be in private subnets and have tightly controlled security group access.

For a comprehensive overview, refer to the full AGENT.md: @terraform/modules/databases/AGENT.md