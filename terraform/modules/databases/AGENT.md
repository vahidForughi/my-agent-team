# Codebase Orientation Map

## 1-Line Summary
This Terraform module provisions managed database services on AWS for DocumentDB (MongoDB), ElastiCache Redis, RDS PostgreSQL, and RDS SQL Server.

## 5-Minute Explanation
- **Primary tasks in code**: Provisioning AWS DocumentDB for Catalog service, ElastiCache Redis for Basket service, RDS PostgreSQL for Discount service, and RDS SQL Server for Ordering service. It also creates necessary DB subnet groups.
- **Primary inputs**: `project_name`, `environment`, `private_subnet_ids`, `databases_sg_id`, and sensitive database passwords (`mongodb_password`, `postgres_password`, `mssql_password`).
- **Primary outputs**: Endpoints for DocumentDB, Redis, PostgreSQL, and MSSQL databases.
- **Key files**:
    - `main.tf`: Defines the AWS resources for each database service and their configurations.
    - `variables.tf`: Declares input variables for the module, including sensitive credentials.
    - `outputs.tf`: Defines the output values (endpoints) for the deployed databases.
- **Main code paths**: The module receives input variables, uses them to define and configure AWS database resources, and then outputs the endpoints for these resources.

## Deep Dive
- **Type**: Terraform module
- **Primary runtime(s)**: HashiCorp Terraform CLI
- **Entry points**:
    - `main.tf`: The primary file defining all database resources and their interconnections.
    - `variables.tf`: Defines the inputs this module expects.
    - `outputs.tf`: Defines the outputs this module provides.

## Top-Level Structure
| Path | Purpose | Notes |
|------|---------|-------|
| `main.tf` | Provisions all AWS database resources | DocumentDB, ElastiCache Redis, RDS PostgreSQL, RDS SQL Server |
| `variables.tf` | Defines input variables for the module | Includes sensitive credentials |
| `outputs.tf` | Exports database endpoints | Useful for other modules or applications |

## Key Boundaries
- **Presentation**: _not found in terraform/modules/databases_
- **Application/Domain**: This module directly supports the data persistence layer for the Catalog (DocumentDB), Basket (Redis), Discount (PostgreSQL), and Ordering (SQL Server) microservices.
- **Persistence/External I/O**: Interacts with AWS to create and manage DocumentDB, ElastiCache Redis, and RDS instances.
- **Cross-cutting concerns**: Security is managed via `databases_sg_id` (Security Group ID) passed as an input. Sensitive credentials are handled via `sensitive = true` in `variables.tf`.
- **Responsibilities by file/module**:
    - `main.tf`: Resource definition and configuration for all database services.
    - `variables.tf`: Input variable declarations and default values.
    - `outputs.tf`: Exports connection endpoints for the provisioned databases.
- **Detailed code flows**:
    1. Input variables (`project_name`, `environment`, `private_subnet_ids`, `databases_sg_id`, database passwords) are provided to the module.
    2. `main.tf` uses these variables to define `aws_db_subnet_group`, `aws_docdb_subnet_group`, `aws_elasticache_subnet_group` to place databases in private subnets.
    3. `main.tf` then defines and configures `aws_docdb_cluster` (Catalog), `aws_elasticache_replication_group` (Basket), `aws_db_instance` for PostgreSQL (Discount), and `aws_db_instance` for SQL Server (Ordering).
    4. Each database instance is configured with security groups, instance types, storage, and backup policies based on environment (e.g., `prod` enables multi-AZ and deletion protection).
    5. `outputs.tf` exposes the endpoints of these provisioned databases.
- **How the pieces map together**: The `terraform/main.tf` file calls this module and passes the required variables, including subnet IDs and security group IDs from the `networking` and `security` modules. The module then provisions the databases and exposes their endpoints to the root module.
- **Files inspected**:
    - `terraform/modules/databases/main.tf`
    - `terraform/modules/databases/variables.tf`
    - `terraform/modules/databases/outputs.tf`
    - `terraform/backend.tf`
    - `terraform/main.tf`
    - `terraform/outputs.tf`
    - `terraform/providers.tf`
    - `terraform/variables.tf`
    - `terraform/versions.tf`
    - `terraform/CLAUDE.md`
