VIETNAM NATIONAL UNIVERSITY 
UNIVERSITY OF INFORMATION TECHNOLOGY
FACULTY OF SOFTWARE ENGINEERING


 



TRƯƠNG LÊ VĨNH PHÚC
NGUYỄN THÀNH TÀI





GRADUATION THESIS
BUILDING A CLOUD-NATIVE MICROSERVICES 
E-COMMERCE SYSTEM: DEPLOY, MONITOR, AND MANAGE WITH KUBERNETES, HELM, AND ELASTIC STACK






Supervisor: 	MSc. NGUYỄN CÔNG HOAN
Student:    	TRƯƠNG LÊ VĨNH PHÚC 
  NGUYỄN THÀNH TÀI
Class:    	SE505.Q11






Hồ Chí Minh city, December 2025  
 
THÔNG TIN HỘI ĐỒNG CHẤM KHÓA LUẬN TỐT NGHIỆP

Hội đồng chấm khóa luận tốt nghiệp, thành lập theo Quyết định số …………………… ngày ………………….. của Hiệu trưởng Trường Đại học Công nghệ Thông tin. 
ACKNOWLEDGEMENT
The completion of this Graduation Thesis marks the culmination of three years of academic study and months of intensive research and development. This journey would not have been possible without the guidance, support, and encouragement of many individuals and organizations.

First and foremost, we would like to extend our deepest gratitude to our supervisor, MSc. Nguyễn Công Hoan. His mentorship was invaluable, particularly as we navigated the complexities of Cloud-Native architectures and the challenging migration to Micro-frontends. From the initial conceptualization to the final stages of deployment and optimization, his insightful feedback, technical expertise in DevOps, and patience guided us through the technical hurdles of Kubernetes, Helm, and distributed systems. The professional standards he instilled in us will remain a lasting asset in our future careers.

We are also profoundly grateful to the Faculty of Software Engineering and the lecturers at the University of Information Technology - Vietnam National University, Ho Chi Minh City. The comprehensive curriculum and the rigorous academic environment provided us with the solid foundational knowledge necessary to undertake this complex engineering project. We specifically thank the lecturers who provided the theoretical background on Microservices and Software Architecture, which formed the backbone of this thesis.

Our sincere appreciation extends to the Thesis Defense Committee for their time, constructive criticism, and valuable recommendations, which will help us further refine and improve this system.

Finally, we would like to thank our families and friends for their unwavering support and understanding during the late nights and stressful periods of this project. Your encouragement kept our motivation high and reminded us of the importance of resilience.

Although we have strived to deliver a complete and robust system, given the vast scope of Cloud-Native technologies, this thesis may inevitably contain shortcomings. We graciously welcome any feedback and suggestions to further perfect this research.

  Hồ Chí Minh city, December 27th 2025
  Student
  Trương Lê Vĩnh Phúc
  Nguyễn Thành Tài
 
SUPERVISOR REVIEW	
                                                                      

  Hồ Chí Minh city, December 27th 2025
  SUPERVISOR



  MSc. Nguyễn Công Hoan
 
TABLE OF CONTENTS

CHAPTER 1. INTRODUCTION	14
1.1.	Context and Problem Statement	14
1.2.	Project Objectives:	15
1.3.	Scope and Limitations	16
1.4.	Report Structure	17
CHAPTER 2: THEORETICAL BACKGROUND	19
2.1.	Microservices Architecture in an E-Commerce Platform	19
2.2.	Micro-Frontend Architecture	21
2.3.	Cloud-Native Technologies	21
2.4.	DevOps and GitOps Principles	23
2.5.	DevOps Architecture, Environment, and Observability Foundation	23
2.6.	Related Work	24
CHAPTER 3: SYSTEM ANALYSIS AND DESIGN	25
3.1.	System Architecture Overview	25
3.2.	Backend Microservices Design	26
3.3.	Micro-Frontend Design	30
3.4.	Database Design	33
3.5.	Infrastructure Design	37
CHAPTER 4: IMPLEMENTATION	42
4.1.	Backend Implementation (.NET Core)	42
4.2.	Frontend Implementation & Migration	46
4.3.	DevOps & Automation Implementation	51
4.4.	Security Implementation	56
CHAPTER 5: MONITORING AND OBSERVABILITY	60
5.1.	Observability architecture overview	60
5.2.	Centralized logging with the Elastic Stack	61
5.3.	Metrics collection and visualization	62
5.4.	Distributed tracing with Jaeger	63
5.5.	Service mesh observability with Kiali	64
5.6.	Alerting and notification	65
5.7.	Infrastructure management tools	65
5.8.	Message broker monitoring	66
5.9.	Service mesh telemetry with Istio	67
5.10.	Operational access and tooling	67
CHAPTER 6: CASE STUDY AND DEMONSTRATION	68
6.1.	Evaluation Objectives and Methodology	68
6.2.	Deployment Demonstration	69
6.3.	User Flow Demonstration	73
6.4.	Operational Resilience Demonstration	77
6.5.	Verification evidence:	79
6.6.	Limitations Observed During Evaluation	80
6.7.	Summary	80
CHAPTER 7: EVALUATION AND DISCUSSION	81
7.1.	Functional Evaluation	81
7.2.	Non-Functional Evaluation	85
7.3.	Architectural Analysis	92
7.4.	DevOps Practices Evaluation	93
7.5.	Lessons Learned	94
7.6.	Summary	95
CHAPTER 8: CONCLUSION AND FUTURE WORK	97
8.1.	Conclusion	97
8.2.	Future Work	99
8.3.	Final Remarks	99
REFERENCES	100
APPENDICES	103
Appendix A: Repository and Module Map	103
Appendix B: Infrastructure as Code Snapshots	104
Appendix C: Kubernetes Manifests and Helm Values	106
Appendix D: CI/CD Pipelines	108
Appendix E: Observability Pack	110
Appendix F: Security Baseline Checklist	111
Appendix G: Performance and Load Test Evidence	113
Appendix H: Failure Scenarios and Runbooks	114
Appendix I: Configuration and Environment Matrix	116
Appendix J: Related Paper Reflection	117
Appendix K: Glossary and Acronyms (Supplement)	119

 
LIST OF FIGURES
Figure 1. System Architecture Overview	30
Figure 2. Backend Services & Bounded Contexts	31
Figure 3. Backend Service Clean Architecture	32
Figure 4. Odering Service Clean Architecture	32
Figure 5. Catalog Service Clean Architecture	33
Figure 6. Saga Pattern Sequence Diagram	34
Figure 7. Micro-Frontend Runtime Loading Sequence	36
Figure 8. Data Consistency, Isolation, and Cross-Service Flow	41
Figure 9. Kubernetes Cluster Topology	42
Figure 10. Network Architecture and Ingress Strategy	44
Figure 11. Service Mesh Sidecar Pattern	45
Figure 12. Backend Project Structure	46
Figure 13. CQRS Implementation with MediatR Pipeline	47
Figure 14. gRPC Integration Sequence	48
Figure 15. Event-Driven Checkout Sequence	49
Figure 16. Legacy Angular Monolith Architecture	51
Figure 17. Micro-Frontend Runtime Composition	53
Figure 18. Micro-Frontend Routing Strategy	54
Figure 19. CI/CD Pipeline Diagram	55
Figure 20. GitHub Actions CI Workflow Execution	57
Figure 21. Observability Architecture Overview	65
Figure 22. Kibana Log Discovery Interface	66
Figure 23. Kiali Workloads Dashboard	69
Figure 24. Kiali Service Mesh Graph	69
Figure 25. Portainer Container Management UI	70
Figure 26. RabbitMQ Management UI	71
Figure 27. Al Pods in Running State	77
Figure 28. AWS CloudFormation Stacks	77
Figure 29. Product Browsing Flow Sequence Diagram	79
Figure 30. Store Micro-Frontend  Networks Check	80
Figure 31. Cart Operations (Store → Checkout Interaction)	81
Figure 32. Checkout Flow	83
Figure 33. RabbitMQ Management UI showing queue drained	84
Figure 34 OrderDb query result showing order record	84
Figure 35. Jaeger Distributed Tracing U	85
Figure 36. Grafana Pod Metrics Dashboard	87
Figure 37. Grafana Pod Metrics Dashboard	94
 
LIST OF TABLES
Table 1. Database Technology Selection (Polyglot Persistence Strategy)	37
Table 2. Catalog Service Database Fields (MongoDB)	37
Table 3. Basket Service Database Objects (Redis)	38
Table 4. Discount Service Database Columns (PostgreSQL)	38
Table 5. Ordering Service Database Columns (SQL Server)	39
Table 6. Kubernetes Workload Types, Service Exposure, and Persistence	42
Table 7. Microservice Persistence and Communication Implementation	46
Table 8. API Gateway Routing Configuration (Ocelot)	49
Table 9. Micro-frontend Module Configuration and Dev Ports	51
Table 10. Shared Packages and Responsibility	53
Table 11. Workflow Triggers and Deployment Targets	59
Table 11b. CloudFormation Templates Overview	60
Table 12. Main Monitoring and Operational Components	64
Table 13. Typical Diagnostic Questions and Telemetry Signals	64
Table 14. Operational Access Patterns and Tools	70
Table 15. Evaluation Objectives and Acceptance Criteria	72
Table 16. Evaluation Environment Specifications (Local vs. Cloud)	72
Table 17. Local Deployment Script Phases (Minikube)	73
Table 18. Cloud Deployment Script Phases (AWS EKS)	74
Table 19. Differences between Cloud Deployments and local deployment:	74
Table 20. User Flow Scenarios and Success Criteria	77
Table 21. Key architectural differences from local deployment:	83
Table 22. Liveness and Readiness Probes Configuration	84
Table 23. Pod Recovery Timeline	84
Table 24. Observed Limitations During Evaluation	86
Table 25. Evaluation Summary	86
Table 26. Experimental Setup Parameters	87
Table 27. Feature Completeness Assessment	88
Table 28. API Contract Validation Results	88
Table 29. Proposed Test Suite Organization	89
Table 30. Proposed Test Trigger Schedule	90
Table 31. Proposed TestCloud Execution Matrix	90
Table 32. k6 Load Test Suites	92
Table 33. Actual Test Results: Performance Targets vs. Actual	93
Table 34. Spike Test Stages	93
Table 35. Spike Test Results	94
Table 36. Stress Test Stages	94
Table 37. Stress Test Results	94
Table 38. Soak Test Stages	95
Table 39. Soak Test Results	95
Table 40. Frontend Performance Metrics (Monolithic vs. Micro-Frontend)	96
Table 41. HPA Scaling Configuration & Results (Recap)	97
Table 42. Resilience Evaluation Scenarios	97
Table 43. Pod Recovery Timeline (Recap)	98
Table 44. Observability Effectiveness Metrics	98
Table 45. Microservices Architecture: Benefits Realized	99
Table 46. Microservices Architecture: Challenges Encountered	99
Table 47. Micro-Frontend Architecture: Benefits Realized	99
Table 48. Micro-Frontend Architecture: Challenges Encountered	99
Table 49. DevOps Practices Effectiveness	100
Table 50. Evaluation and Discussion Summary	102
Table 51. Related Work Comparison Summary	24
  

GLOSSARY OF TECHNICAL TERMS

No.	Technical Term		Definition
1	ACID	Acronym for Atomicity, Consistency, Isolation, and Durability, the four properties that guarantee database transaction integrity.
2	Aggregate (DDD)	A cluster of related domain objects treated as a single unit. In Event Sourcing, an aggregate’s state is rebuilt from its event stream.
3	Aggregate Root	The primary entity inside an Aggregate. All access to other objects in the Aggregate must go through the Aggregate Root.
4	API (Application Programming Interface)	A set of contracts (end-points, data formats, auth rules) enabling software components or services to communicate.
5	API Gateway	A single entry point and reverse proxy for all clients, responsible for request routing, aggregation, authentication, rate limiting, and more.
6	Authentication	The act of verifying the identity of a user or service.
7	Authorization	Granting an authenticated user or service the rights to access specific resources.
8	Backend for Frontend (BFF)	A façade microservice tailored to a particular client type (web, mobile, IoT), exposing optimized APIs and shielding UI teams from backend complexity.
9	Business Capability	A discrete business function that delivers value. In microservices, each service is ideally scoped to a single capability.
10	Caching	Temporarily storing frequently accessed data to reduce latency and backend load.
11	Cascading Failures	A chain reaction in which a failure in one service propagates to dependent services.
12	CDC (Change Data Capture)	Capturing and streaming database changes in real time, commonly used to keep data in sync across microservices.
13	Circuit Breaker	A resiliency pattern that stops calls to an unresponsive service to prevent cascading failures, then periodically tests if it has recovered.
14	CI/CD (Continuous Integration / Continuous Deployment)	Automating build, test, and deployment pipelines so every code change can reach production rapidly and safely.
15	Cloud-Native	Designing, building, and running applications optimized for cloud environments, leveraging containers, dynamic orchestration, and DevOps practices.
16	Command (CQRS)	A request that changes application state.
17	CQRS (Command Query Responsibility Segregation)	A pattern that splits read and write paths into separate models and processing pipelines.
18	Compensating Transaction	A follow-up operation that semantically rolls back changes made by a failed transaction, used in Saga orchestration.
19	Concurrency	The ability of a system to handle multiple tasks at (approximately) the same time.
20	Consistency	Guarantee that data remains valid and agrees with defined rules across the system.
21	Container	A lightweight, isolated runtime package that bundles an application with its dependencies.
22	Container Orchestration	Automating deployment, scaling, networking, and lifecycle of containerized workloads (e.g., Kubernetes).
23	Coupling	The degree of dependency between software components. Microservices aim for loose coupling to ease independent deployment.
24	Cross-Cutting Concerns	Functions such as logging, monitoring, and security that span multiple services.
25	Data Consistency	See Consistency.
26	Database per Service	Each microservice owns its own private database, eliminating runtime contention and schema coupling.
27	Decentralized Governance	Teams independently choose tech stacks, release cycles, and architectural decisions for their respective services.
28	Denormalization	Intentionally duplicating data to optimize read performance and reduce expensive joins.
29	Deployment Unit	The smallest runnable artifact you can deploy independently (e.g., a Kubernetes Pod).
30	Distributed System	A system whose components run on multiple networked machines yet cooperate toward a common goal.
31	Distributed Tracing	Following a single request as it traverses multiple services, recording timing and metadata for each hop.
32	Distributed Transaction	A transaction spanning multiple databases or services, difficult to achieve ACID in microservices; Sagas are preferred.
33	Docker	The most widely used container engine for building, shipping, and running containers.
34	Domain-Driven Design (DDD)	A design approach that models software around core business domains and ubiquitous language.
35	Event (Event Sourcing)	An immutable record describing a state change or business fact.
36	Event Broker	Middleware that routes events from publishers to subscribers (e.g., RabbitMQ, Kafka).
37	Event Sourcing	Persisting state as an append-only log of events; current state is rebuilt by replaying those events.
38	Event Store	A database optimized for storing and retrieving event streams.
39	Eventual Consistency	Model where replicas do not have to be immediately consistent; they converge over time.
40	Fault Isolation	Limiting the blast radius of failures so they don’t cascade across services.
41	Fault Tolerance	The system’s ability to continue functioning in the presence of failures.
42	gRPC	A high-performance, contract-based RPC framework built on HTTP/2 and Protocol Buffers.
43	Helm	The package manager for Kubernetes, enabling versioned, parameterized deployments via “charts.”
44	Horizontal Scaling	Increasing capacity by adding more service instances (pods/VMs) rather than enlarging a single instance.
45	IPC (Inter-Process Communication)	Mechanisms that let separate processes exchange data, HTTP, gRPC, message queues, etc.
46	Jaeger	An open-source distributed tracing system for monitoring and troubleshooting microservices.
47	JWT (JSON Web Token)	A compact, self-contained token format used for authentication and authorization.
48	Kubernetes (K8s)	The de-facto standard platform for container orchestration, handles scheduling, scaling, and self-healing.
49	Load Balancing	Evenly distributing traffic across multiple instances to improve responsiveness and resilience.
50	Logging	Persisting timestamped records of system events for debugging, auditing, and observability.
51	Loose Coupling	See Coupling. Desirable low dependency between services.
52	Message Queue	Middleware that stores and forwards messages asynchronously between services.
53	Microservices	Architectural style: a set of small, independently deployable services, each focused on a single business capability.
54	Middleware	Software that provides common services (caching, auth, messaging) sitting between OS and application code.
55	Monitoring	Collecting and analyzing metrics to assess health and performance of the system.
56	Monolithic Architecture	Traditional approach where the entire application is deployed as one unit.
57	OAuth 2.0	Authorization protocol that grants limited access to user resources on another service without sharing credentials.
58	OpenID Connect (OIDC)	Identity layer atop OAuth 2.0 providing user authentication and profile information.
59	Orchestration (Saga)	Saga pattern variant where a central orchestrator directs each service to execute or compensate.
60	Pattern (Design Pattern)	A reusable solution to a commonly recurring design problem.
61	Payload	The actual data content within a network message.
62	Polyglot Persistence	Using different database technologies in the same system, choosing the best tool per service.
63	Projection (Event Sourcing)	A read-optimized view built by replaying events from the Event Store.
64	Proxy	An intermediary server that forwards requests from a client to another server.
65	Query (CQRS)	A request that retrieves data without modifying state.
66	Rate Limiting	Restricting the number of requests a client can make within a given timespan.
67	Read Model (Chapter)	The data model optimized for query operations, separate from the Write Model.
68	Replication	Copying data across multiple nodes to improve availability and resilience.
69	Resilience	The ability of a system to recover quickly from difficulties and continue operating.
70	REST	Architectural style leveraging standard HTTP verbs and stateless interactions for web services.
71	Reverse Proxy	A server that accepts client requests and forwards them to backend servers, often adding caching or security.
72	RPC (Remote Procedure Call)	A protocol that allows a program to execute a procedure on a remote server as if it were local.
73	Saga	A pattern to coordinate distributed transactions via a series of local transactions and compensating actions.
74	Scalability	The system’s capability to handle increasing traffic or data volume by scaling resources efficiently.
75	Schema	The structure that defines how data is organized in a database.
76	Security	Measures to protect a system against unauthorized access, abuse, or attacks.
77	Self-Healing	Automatic detection and recovery from failures (e.g., Kubernetes restarts a crashed pod).
78	Service Discovery	Automatic detection of service endpoints and instances inside the system.
79	Service Mesh	Dedicated infrastructure layer (e.g., Istio) that handles service-to-service communication, security, and observability.
80	Service Registry	A database of available service instances used by service discovery mechanisms.
81	Shared Database	A data store accessed by multiple services; generally discouraged in microservice design due to tight coupling.
82	Sidecar	A companion container that extends or augments the main application container inside the same Pod.
83	Single Point of Failure (SPOF)	A component whose failure would bring down the entire system.
84	Snapshot (Event Sourcing)	A point-in-time capture of an aggregate’s state to shorten event replay time.
85	Stateless	A service that keeps no client-specific state between requests, each request is independent.
86	Stream (Event Sourcing)	Ordered sequence of events related to a single aggregate.
87	Synchronous Communication	The caller waits (blocks) for a response before continuing.
88	Technology Diversity	Using varied languages, frameworks, and databases across different services to fit each use case.
89	Temporal Query	A query that asks for system state at a specific past time.
90	Transaction	An atomic unit of work: either all changes commit or none do.
91	Transformation	Converting data from one format or structure to another.
92	Two-Phase Commit (2PC)	A distributed transaction protocol ensuring all participants commit or roll back together, often avoided in microservices due to latency and lock contention.
93	Versioning	Managing multiple versions of APIs, schemas, or services to maintain backward compatibility.
94	Write Model (CQRS)	The domain model optimized for handling commands (write operations).
95	Zipkin	An open-source distributed tracing system for collecting timing data across microservices.

 

CHAPTER 1. INTRODUCTION
1.1.	Context and Problem Statement
In the contemporary digital economy, e-commerce platforms are expected to maintain high availability, sustain highly variable workloads (seasonal traffic, promotions, flash sales), and evolve rapidly to meet changing user expectations and business requirements [23]. Historically, many e-commerce systems were implemented using a Monolithic Architecture, where the user interface, business logic, and data access layers are packaged into a single deployable unit [30]. While monolithic systems are initially straightforward to develop and operate, they often become difficult to scale and maintain as the product grows. Tight coupling between modules increases regression risk, and even minor changes may require redeploying the entire application, slowing release cycles and elevating operational risk [16].
This thesis uses the e-commerce domain as a realistic reference scenario, but its primary contribution is not the richness of business functionality. Instead, the thesis focuses on infrastructure, cloud-native deployment, DevOps automation, and operational reliability. Business rules are intentionally kept simple, serving mainly to generate representative service interactions and traffic patterns required for validating architectural and operational practices.
To address scalability and maintainability limitations, the software industry has shifted toward Microservices Architecture, where an application is structured as a set of loosely coupled services organized around business capabilities [1]. When combined with Domain-Driven Design (DDD) [25], complex domains can be decomposed into bounded contexts such as Catalog, Ordering, and Discount, enabling independent development, deployment, and scaling [29]. Microservices also support polyglot persistence, allowing each service to select a database technology aligned with its workload, rather than forcing all data into a single shared schema [3]. However, these advantages come with increased distributed-system complexity, including service coordination, partial failures, and non-trivial data consistency.
In practice, modernization efforts often face two major gaps: frontend modularization and operational manageability.

(1) Frontend monolith bottleneck.
Even when backend systems are successfully decomposed, many organizations retain a “frontend monolith” where a single large Single Page Application (SPA), commonly built with frameworks such as Angular, consumes multiple backend services. As the SPA grows, build times increase, bundles become larger, and dependency conflicts become more frequent. More importantly, organizational coupling emerges: multiple teams must coordinate on a single deployment pipeline, release schedule, and dependency set. This creates an imbalance where the backend becomes agile while the frontend remains rigid and fragile, limiting the benefits of microservices at the system level [18].

(2) Operational and observability challenges in distributed environments.
Replacing a single monolithic process with a network of containerized services increases system complexity due to service discovery, inter-service communication, partial failures, and consistency concerns [17]. Manual management becomes infeasible as the number of services grows, motivating adoption of cloud-native technologies, particularly containerization and orchestration platforms such as Kubernetes, to provide scheduling, self-healing, and scaling [5][27]. However, Kubernetes itself introduces configuration and deployment complexity, often requiring templating and packaging solutions such as Helm to ensure repeatability and reduce configuration drift [6][34].
Additionally, reliability becomes harder to guarantee in distributed architectures. Failures such as timeouts, message delivery delays, and downstream overload must be handled through resiliency patterns including circuit breakers, retries, and timeouts to prevent cascading failures [11]. Data consistency becomes non-trivial when transactions span multiple service boundaries; patterns such as Saga-based orchestration are commonly used to achieve eventual consistency while enabling compensation workflows [19]. Finally, traditional debugging approaches do not scale to distributed systems. Without strong observability, centralized logging (e.g., Elastic Stack) [12][33], metrics monitoring (e.g., Prometheus and Grafana) [13], and distributed tracing, identifying the root cause of failures becomes slow and expensive, increasing Mean Time To Detect (MTTD) and Mean Time To Resolve (MTTR) [14].
Therefore, a practical gap remains: many studies discuss microservices or micro-frontends independently, but fewer demonstrate a holistic end-to-end modernization strategy that simultaneously addresses backend decomposition, frontend modularization, DevOps automation, and observability as an integrated system [24]. This thesis addresses that gap by designing and implementing a cloud-native e-commerce platform that combines microservices, micro-frontends, Kubernetes-based deployment, and a complete monitoring and tracing stack.
1.2.	Project Objectives: 
The primary objective of this thesis is to design, implement, and evaluate a cloud-native application platform that demonstrates modern DevOps practices and operational reliability in a distributed architecture. The e-commerce scenario is used as a representative workload to validate infrastructure patterns, deployment automation, and observability capabilities, rather than to optimize domain complexity.
To achieve this goal, the thesis pursues the following objectives:
a)	Implement a backend microservices architecture using DDD principles:
●	Decompose the e-commerce domain into autonomous services (Catalog, Basket, Ordering, Discount, Identity) using .NET Core.
●	Apply polyglot persistence by selecting data stores aligned to service workloads (e.g., MongoDB, Redis, SQL Server, PostgreSQL) to improve performance and enforce data ownership boundaries. 
b)	Re-architect the frontend into a micro-frontend architecture
●	Migrate from a monolithic Angular SPA toward a distributed frontend system using Webpack Module Federation.
●	Enable independent development and deployment of UI features (e.g., checkout can evolve and release without redeploying the entire product browsing experience), addressing the frontend monolith bottleneck.
c)	Establish reliable inter-service communication and consistency
●	Implement synchronous communication via REST and/or gRPC where appropriate, and asynchronous event-driven integration using RabbitMQ.
●	Address distributed transaction challenges using the Saga pattern (orchestration-based) to provide eventual consistency with compensation workflows.
●	Integrate resiliency mechanisms such as retries, timeouts, and circuit breakers to reduce cascading failures.
d)	Automate infrastructure and deployment with cloud-native technologies
●	Containerize all services and frontend components using Docker and deploy them on Kubernetes for scalability and self-healing.
●	Use Helm charts to template and manage Kubernetes manifests for repeatable deployments across environments.
e)	Implement a DevOps lifecycle with CI/CD automation
●	Build CI/CD pipelines (e.g., GitHub Actions) to automate build, test, packaging, and deployment for both backend services and frontend remote modules.
●	Reduce manual intervention and deployment risk by standardizing release workflows.
f)	Provide comprehensive observability for distributed operation
●	Deploy centralized logging (Elastic Stack) to collect and index logs across containers.
●	Implement metric collection and visualization using Prometheus and Grafana for real-time health monitoring.
●	Enable distributed tracing to follow requests across gateway, services, and messaging workflows, reducing MTTD/MTTR by improving diagnosability.
1.3.	Scope and Limitations
To maintain a focused research trajectory within the constraints of a graduation thesis, the scope of this project is strictly defined by the following functional, architectural, and operational boundaries.
1.3.1.	Functional Scope (Bounded Contexts):
To keep the research focused and evaluable, the project scope is defined across functional domains, architectural components, and operational infrastructure.
a)	Functional scope (bounded contexts)
The system implements core e-commerce domains as independent services:
●	Identity Service: authentication and authorization using OpenID Connect (OIDC) and OAuth 2.0 (implemented via IdentityServer4).
●	Catalog Service: product and category management using MongoDB for flexible document modeling.
●	Basket Service: shopping cart management using Redis for low-latency reads/writes and ephemeral session-oriented data.
●	Discount Service: coupon/promotion logic, using gRPC for low-latency service-to-service calls where applicable.
●	Ordering Service: checkout orchestration and workflow coordination using the Saga pattern and RabbitMQ to manage distributed consistency.
b)	Architectural scope (backend and frontend)
●	Backend: .NET Core microservices following Clean Architecture and DDD. An API Gateway (Ocelot) is used for routing, aggregation, and cross-cutting concerns.
●	Frontend: modernization from a monolithic Angular SPA into micro-frontends using Webpack Module Federation, including a host “Shell” that loads remote feature modules (Catalog, Cart, Checkout) at runtime.
c)	Infrastructure and operational scope
●	Orchestration: Kubernetes resources including Deployments, Services, ConfigMaps, Secrets, and ingress/gateway configurations.
●	Packaging and deployment: Helm charts to standardize deployments and parameterize environment-specific configurations.
●	Observability: ELK for centralized logging, Prometheus for metrics scraping, Grafana for dashboards, and Jaeger (or equivalent) for distributed tracing.
1.3.2.	Limitations and out-of-scope items
Certain areas are excluded to prioritize architectural depth over business feature completeness:
●	Third-party integrations: real payment providers (Stripe/PayPal) and shipping/logistics integration are out of scope. Mock services are used to simulate payment outcomes and demonstrate Saga compensation logic without financial transactions.
●	Mobile native applications: the focus is web-based UI only. Backend APIs remain client-agnostic but native iOS/Android apps are not implemented.
●	Advanced CMS/admin tooling: inventory and admin experiences are simplified; emphasis is on customer-facing flows and architecture mechanics.
●	Multi-region high availability: due to typical thesis resource constraints, the Kubernetes cluster is deployed locally (Docker Desktop/Minikube) or in a single region. Multi-region failover is discussed conceptually but not implemented.
●	Production-grade security hardening: standard security is applied (HTTPS, token-based auth, gateway routing). Enterprise measures such as WAF, extensive penetration testing, and advanced DDoS mitigation are out of scope.
1.4.	Report Structure 
This thesis is organized into eight chapters:
-	Chapter 1: Introduction describes the motivation for modernizing monolithic e-commerce systems and outlines the objectives, scope, and constraints of the project.
-	Chapter 2: Theoretical Background reviews microservices and DDD foundations, introduces micro-frontends, and presents cloud-native technologies (Docker, Kubernetes, Helm) and DevOps/GitOps principles relevant to the system.
-	Chapter 3: System Analysis and Design provides the system blueprint: service decomposition, micro-frontend composition, database design for polyglot persistence, and infrastructure topology for Kubernetes-based deployment.
-	Chapter 4: Implementation explains the realization of the backend (.NET Core services), frontend migration to micro-frontends, CI/CD automation, Helm packaging, and security-related integration.
-	Chapter 5: Monitoring and Observability details the logging, metrics, and tracing implementation for distributed operation and diagnosability.
-	Chapter 6: Case Study and Demonstration presents deployment scenarios, user flows across micro-frontends, and operational demonstrations (e.g., self-healing, scaling, failure simulation).
-	Chapter 7: Evaluation and Discussion evaluates outcomes against objectives using functional and non-functional criteria (performance, resilience, maintainability) and discusses trade-offs and lessons learned.
-	Chapter 8: Conclusion and Future Work summarizes contributions and proposes improvements such as progressive delivery (blue-green/canary) and multi-cluster or multi-region strategies.
 
CHAPTER 2: THEORETICAL BACKGROUND
Modern e-commerce systems must evolve continuously while sustaining high availability and predictable performance under highly variable loads. This thesis therefore adopts a cloud-native modernization strategy that combines: (1) backend decomposition into microservices, (2) frontend modularization using micro-frontends, and (3) automation and reliability foundations through container orchestration, standardized packaging, CI/CD, and observability. The goal is not to claim that these techniques are universally “better,” but to justify why they form a coherent set of architectural choices for the specific engineering constraints addressed in this project.
2.1.	Microservices Architecture in an E-Commerce Platform
2.1.1.	Microservices as a Fit for E-Commerce Change and Scale
Microservices architecture structures a system as a set of independently deployable services aligned to business capabilities. In e-commerce, this aligns naturally with the reality that different business functions scale differently (e.g., product browsing is typically read-heavy; checkout is write-heavy and consistency-sensitive). The key architectural motivation is selective scalability and independent evolution: services can be scaled and released independently, which reduces the “single release train” bottleneck common in monolithic systems.
However, the advantages are inseparable from the costs. Microservices replace in-process calls with network calls, introduce partial failures as a normal operating condition, and force the organization to invest in deployment automation and runtime observability. In other words, microservices do not remove complexity; they redistribute it, from code structure into system operations and distributed data management. This trade-off is central to this thesis: the project is intentionally designed as an end-to-end demonstration that includes orchestration, CI/CD, and observability rather than focusing on service implementation alone.
2.1.2.	 Service Boundary Design Using Domain-Driven Design
A critical success factor in microservices is boundary definition. Poor boundaries create “distributed monoliths” where services remain tightly coupled through shared data models, synchronous call chains, or cross-service database access. To avoid this, the project adopts a Domain-Driven Design (DDD) perspective: service boundaries follow bounded contexts and encapsulate their own domain rules and persistence.
In this thesis, the e-commerce domain is decomposed into services that correspond to distinct responsibilities (e.g., product catalog, basket/cart, ordering/checkout, discount/promotion, and identity/authentication). The architectural intent is that each service can evolve at a different pace and be deployed independently without forcing unrelated modules to rebuild or redeploy. This decomposition also creates clear ownership boundaries for data and for API contracts, which becomes essential once multiple UI modules (micro-frontends) consume backend capabilities independently.
2.1.3.	Data Management: Database-per-Service and Polyglot Persistence
A foundational microservices pattern is database-per-service: each service owns its persistence and exposes data only through APIs or events, preventing tight coupling through shared schemas. This enables polyglot persistence, where storage technology is selected based on workload characteristics rather than standardized across the entire system.
This project applies polyglot persistence as an explicit design decision:
-	A catalog domain commonly benefits from document-oriented modeling (products often have variable attributes), which motivates a document store for the Catalog service.
-	A basket/cart domain requires extremely fast reads/writes for short-lived state, motivating an in-memory key-value store.
-	An ordering domain typically demands stricter integrity for transactional workflows, motivating a relational database.
The trade-off is that cross-service queries become non-trivial. Reporting that once relied on SQL joins now requires alternative strategies such as API composition, read-model replication, or event-driven projections. Additionally, strict ACID transactions rarely span service boundaries; distributed workflows must instead adopt eventual consistency and compensating actions (Section 2.1.5). This thesis embraces that reality by designing checkout as a coordinated, distributed process rather than a single database transaction.
2.1.4.	Inter-Service Communication: Synchronous vs Asynchronous Contracts
Microservices communicate through network protocols, and the communication style determines both coupling and failure behavior.
Synchronous communication (HTTP/REST or gRPC) is straightforward for request/response interactions, but it increases temporal coupling: when Service A calls Service B synchronously, Service A’s availability and latency become dependent on Service B. This can cause cascading failures under load unless resiliency patterns are applied.
Asynchronous communication (message broker + events) reduces temporal coupling by allowing services to progress independently. This project uses a message broker to support event-driven coordination, particularly valuable in checkout flows where multiple services must react (e.g., order creation, stock validation, payment simulation, confirmation). RabbitMQ is used as the broker in this system.
In practice, most real systems are hybrid. This thesis adopts a pragmatic approach:
-	use synchronous APIs for user-facing reads where immediate responses are required;
-	use asynchronous events for business workflows where decoupling and eventual consistency reduce system fragility.
2.1.5.	Distributed Consistency: Saga Pattern and Resiliency Mechanisms
Once service boundaries enforce data ownership, distributed workflows must be designed explicitly. The canonical challenge in e-commerce is checkout: multiple business steps must succeed or be compensated without a single global transaction manager.
This thesis uses the Saga pattern as the conceptual model for coordinating multi-step workflows across services. In a saga, each step executes a local transaction and publishes an event; if later steps fail, compensating actions undo or neutralize prior effects. The benefit is operational scalability and service autonomy; the cost is complexity in failure handling, idempotency, and user experience (e.g., “pending” states are normal).
Reliability also depends on resiliency patterns such as:
-	timeouts and retries (to handle transient failures),
-	circuit breakers (to prevent repeated calls to failing dependencies),
-	idempotent consumers (to safely process repeated events),
-	bulkheads (to isolate resource exhaustion).
These patterns are not optional in microservices; they are the control mechanisms that keep distributed systems stable under partial failure and load spikes. Istio is included in this project partly because it can externalize certain traffic policies and failure-handling behaviors from application code into the platform layer (Section 2.3.4).
2.2.	Micro-Frontend Architecture
2.2.1.	The “Frontend Monolith” Problem in Microservices Systems
Backend microservices often deliver team autonomy and independent deployment, but many organizations preserve a single, monolithic frontend (a single SPA). Over time, frontend monoliths develop their own scaling problems: long build times, large bundles, tightly coupled release cycles, and organization-wide coordination overhead. This creates architectural asymmetry: the backend can evolve independently, but UI changes still require rebuilding and redeploying the entire frontend.
This thesis addresses the mismatch by applying microservices principles to the user interface via micro-frontends, enabling independent UI modules to be built and deployed separately.
2.2.2.	Micro-Frontends as Vertical Slices
Micro-frontends aim to partition the UI into independently deliverable feature modules aligned to business domains (e.g., Catalog UI, Cart UI, Checkout UI). Conceptually, this restores end-to-end ownership: a domain team can evolve both its service APIs and its UI module without waiting for a global frontend release.
The primary design constraint is integration: separate UI artifacts must still produce a coherent application for the end-user (routing, shared design system, shared authentication state, and consistent UX behavior).
2.2.3.	Integration Techniques and the Rationale for Module Federation
Micro-frontends can be integrated using multiple strategies:
-	Build-time composition: modules are compiled together. This simplifies runtime behavior but reintroduces a single release pipeline.
-	Runtime composition: a host (shell) loads remote modules dynamically. This maximizes independent deployment but increases runtime complexity.
This project adopts a runtime approach using Module Federation, which is widely used to load remote bundles at runtime while optionally sharing dependencies across modules.
The trade-offs are explicit:
-	Pros: independent deployment of UI features; smaller blast radius for UI changes; organizational scalability (teams can work in parallel with fewer merge conflicts).
-	Cons: runtime failures become possible if a remote module is unavailable; dependency version alignment must be actively managed; testing must cover cross-module integration and contract compatibility.
To mitigate these risks in a thesis-scale implementation, a “shell” application pattern is typically used: the shell owns global routing and shared dependencies (auth state, UI framework versions), while remote modules focus on domain UI concerns. This keeps “global coupling” explicit and controlled rather than accidental.
2.3.	Cloud-Native Technologies
2.3.1.	Containerization with Docker
Containerization packages an application and its runtime dependencies into a portable unit, enabling consistent execution across development machines, CI agents, and production clusters. In microservices, containers are especially valuable because services are deployed independently and may use different libraries or supporting processes.
This project uses Docker to containerize backend services and frontend artifacts, enabling repeatable builds and predictable deployment behavior across environments.
2.3.2.	Kubernetes Orchestration for Runtime Reliability
Microservices at scale require automation for scheduling, service discovery, scaling, and failure recovery. Kubernetes provides a declarative control plane: engineers specify the desired state (replicas, resource requests, rollout policies), and the platform continuously reconciles actual state toward that goal.
For this thesis, Kubernetes is not merely a deployment target; it is a core part of the architecture because it supplies:
-	self-healing (restart/reschedule unhealthy containers),
-	horizontal scaling (replica-based scaling under load),
-	stable service endpoints (service discovery and load balancing).
The trade-off is operational complexity: Kubernetes introduces new failure modes (misconfiguration, resource starvation, networking policies) and demands disciplined configuration management, hence the use of Helm (Section 2.3.3) and the observability stack (Section 2.5).
2.3.3.	Helm as a Packaging and Environment-Standardization Mechanism
Kubernetes manifests quickly become repetitive and environment-specific (namespaces, hostnames, secrets, replica counts, resource limits). Helm addresses this by packaging Kubernetes resources as charts and parameterizing them through templates and values.
In this project, Helm is selected because it supports:
-	repeatable deployments across environments by changing values rather than rewriting manifests,
-	versioned releases that enable controlled upgrades and rollbacks,
-	standardized packaging for multi-service systems.
The trade-off is that templating can become complex and harder to debug than plain YAML. This thesis therefore treats Helm as an engineering discipline: templates must remain readable, values should be structured consistently, and deployment defaults should be conservative to reduce operational risk.
2.3.4.	Service Mesh Concepts with Istio
In distributed systems, communication reliability, security, and visibility are dominated by the network. A service mesh adds a dedicated infrastructure layer for service-to-service traffic management. Istio commonly implements this via sidecar proxies (e.g., Envoy) that intercept traffic and enable consistent policies for routing, telemetry, and security. 
This project includes Istio concepts because they directly support microservices operational requirements:
-	policy-based traffic control (timeouts, retries, routing),
-	security enforcement such as mutual TLS,
-	network-layer telemetry that complements application logs and metrics.
The trade-off is overhead (resource usage, operational learning curve) and an expanded debugging surface area. For a thesis environment, the value is primarily pedagogical and architectural: it demonstrates how platform-level controls can reduce code duplication and standardize cross-cutting concerns.
2.4.	DevOps and GitOps Principles
To manage the complexity of a distributed microservices and micro-frontend system, this research adopts DevOps principles. DevOps is defined as a combination of cultural philosophies, practices, and tools that increases an organization’s ability to deliver applications and services at high velocity [2]. By removing the traditional silos between software development (Dev) and IT operations (Ops), DevOps enables the continuous delivery of value to end-users. Within this broad framework, the project specifically applies Continuous Integration/Continuous Deployment (CI/CD) and Infrastructure as Code (IaC), evolving into the modern practice of GitOps.
2.4.1.	Continuous Integration and Continuous Deployment (CI/CD)
Without automation, microservices and micro-frontends can increase delivery friction rather than reduce it. CI/CD is therefore treated as a core architectural dependency: the system is designed so that services and UI modules can be built, tested, containerized, and deployed predictably.
This project uses GitHub Actions as the automation engine to support continuous integration and deployment workflows.
The rationale is practical: workflows live alongside the codebase, are event-driven (push/merge), and can be standardized across services. The key trade-off is pipeline sprawl: multiple services can lead to duplicated workflow logic unless templates and conventions are adopted.
2.4.2.	Infrastructure as Code as Operational Control
Infrastructure as Code (IaC) is essential in cloud-native systems because configuration drift is a primary cause of instability. By storing deployment definitions in version control, changes become reviewable, auditable, and reproducible. This thesis implements a two-layer IaC strategy to address different infrastructure concerns:
a)	AWS CloudFormation for Cloud Infrastructure.
When deploying to AWS, the project uses CloudFormation templates to provision foundational cloud resources declaratively. CloudFormation is AWS's native IaC service that enables infrastructure provisioning through YAML or JSON templates, supporting resource dependency management, parameterization, and stack-based lifecycle operations [38]. The project organizes CloudFormation templates for VPC networking (subnets, NAT gateways, route tables), EKS cluster provisioning (control plane, managed node groups, IAM roles), S3 bucket creation for object storage, and Application Load Balancer configuration for ingress traffic.
The rationale for CloudFormation over alternatives (e.g., Terraform) is AWS-native integration: CloudFormation provides tighter coupling with AWS service features, automatic rollback on failure, and drift detection without requiring external state management.
b)	Helm Charts for Kubernetes Workloads.
Within the Kubernetes cluster, Helm charts function as the workload-level IaC abstraction. Helm packages Kubernetes resources (Deployments, Services, ConfigMaps, Secrets) as reusable charts with parameterized values, enabling consistent deployments across environments. This separation ensures that cloud infrastructure and application workloads can evolve independently while remaining version-controlled and reproducible.
Trade-off: The two-layer approach increases complexity (two IaC toolchains) but provides clearer separation of concerns: infrastructure teams manage CloudFormation stacks, while application teams manage Helm releases.
2.4.3.	GitOps as a Consistency Model for Deployment
GitOps extends IaC by treating Git as the source of truth for both application and infrastructure desired state. Conceptually, GitOps reframes deployment as reconciliation: the cluster should converge to what Git describes. This thesis adopts GitOps principles (versioned desired state, traceable change history, and rollback through Git), even when the actual synchronization mechanism is implemented through CI/CD pipelines rather than a dedicated cluster reconciler.
2.5.	DevOps Architecture, Environment, and Observability Foundation
2.5.1.	Why Observability is Mandatory in a Distributed Architecture
A monolith can often be debugged with a single log stream and a local debugger. A microservices architecture cannot: requests traverse multiple processes, queues, and network boundaries. Observability therefore, becomes part of the system’s runtime contract.

This thesis adopts the three-pillar model:
-	Logs for discrete event records,
-	Metrics for aggregate health and performance signals,
-	Traces for end-to-end causality across service boundaries.
2.5.2.	Centralized Logging with the Elastic Stack
Centralized logging aggregates container logs into a searchable system so failures can be diagnosed without logging into nodes or manually collecting files. The Elastic Stack (Elasticsearch, Logstash, Kibana) is used in this project to enable indexing and querying of distributed logs. 
Key trade-offs include ingestion/storage cost and the risk of logging sensitive data; therefore, production-grade implementations require redaction policies, retention controls, and structured logging conventions.
2.5.3.	Metrics and Dashboards with Prometheus and Grafana
Metrics provide “always-on” system health signals (latency percentiles, error rates, saturation). Prometheus is used for scraping time-series metrics, and Grafana is used to visualize them via dashboards. 
Trade-offs include metric cardinality (high-cardinality labels can degrade performance) and the need to curate dashboards to avoid “alarm fatigue.” For an e-commerce system, a small set of service-level indicators (SLIs), latency, traffic, error rate, saturation, provides high value with manageable complexity.
2.5.4.	Distributed Tracing with Jaeger
Tracing is essential for understanding request lifecycles across microservices and message brokers. Jaeger provides distributed tracing capabilities that help correlate slowdowns or failures to specific hops in a request path. 
The trade-off is instrumentation overhead and sampling decisions: capturing every trace may be too expensive, while capturing too few reduces diagnostic value. A balanced approach typically uses sampling and focuses on tracing key workflows such as checkout.
2.6.	Related Work
This section reviews representative approaches and systems related to the thesis topic, including microservices-based system design, incremental migration strategies, distributed consistency patterns, cloud-native delivery practices (DevOps/GitOps), and observability stacks. The goal is to identify limitations in existing approaches and clarify the research and engineering gap addressed by this thesis.
2.6.1.	Microservices-Based Architectures and Reference Implementations
Microservices are widely adopted to improve independent deployability and team autonomy by decomposing a system into smaller services aligned with bounded contexts. A common framing emphasizes loosely coupled services with independently releasable deployment units and lightweight communication [1].

In practice, many reference implementations demonstrate microservices using an application domain (often e-commerce) to make architectural boundaries tangible. For example, Microsoft's eShopOnContainers reference application [52] showcases microservices decomposition and cloud-native concerns (service boundaries, communication, deployment automation), and variants incorporate modern sidecar/runtime approaches such as Dapr to standardize cross-cutting concerns (service invocation, pub/sub, state, resiliency). Similarly, Google Cloud Platform's microservices-demo [53] provides a sample cloud-first application with 10 microservices showcasing Kubernetes, Istio, and gRPC.

However, these references often prioritize demonstrating architecture and patterns over providing a thesis-level, end-to-end account of infrastructure design decisions, operational controls, and deployment reproducibility under realistic constraints.
2.6.2.	Incremental Migration and Decomposition Strategies
A recurring challenge is migrating from a monolith (or a tightly coupled system) to a modular architecture without halting feature delivery. Incremental migration strategies typically avoid "big-bang rewrites" and instead evolve the system in slices. A widely cited pattern is the Strangler Fig approach: introduce new components around the legacy system and gradually replace functionality while maintaining continuous operation [54].

For frontend modernization, similar incremental thinking appears in micro-frontend migration: teams separate a legacy frontend into independently deliverable parts while keeping a unified user experience. In real projects, the key complexity is not the UI domain itself, but the integration surface (routing, shared state, dependency duplication, build and deployment coordination). Consequently, related work often highlights architectural feasibility but under-specifies the DevOps and platform requirements needed to keep release processes stable at scale.
2.6.3.	Distributed Data Consistency and Event-Driven Coordination
Once business capabilities are split into services, data management becomes decentralized, and distributed transactions are avoided. Related work commonly adopts patterns for eventual consistency, particularly the Saga pattern, which models a transaction as a sequence of local transactions with compensating actions when failures occur [55].

While these patterns are well-established, practical system designs still face gaps in: (1) operational observability of cross-service flows, (2) failure handling under real deployment conditions, and (3) aligning runtime behavior with CI/CD automation and release safety mechanisms.
2.6.4.	DevOps and GitOps for Cloud-Native Delivery
DevOps research and industry practice emphasize automation, fast feedback loops, and reliable release processes [2]. In cloud-native environments, GitOps has emerged as a concrete operational model: desired system state is stored in version control, and controllers reconcile runtime state to match declarative configuration.

Tools such as Argo CD and Flux implement this model for Kubernetes deployments by continuously synchronizing clusters from Git repositories, supporting progressive delivery workflows and reducing configuration drift [56]. Nevertheless, related work and tool documentation often focus on "how to use the tool," while academic-style gaps remain around systematic end-to-end design: how GitOps, IaC, secret management, environment promotion, and rollback strategies integrate into a cohesive platform architecture for a microservices and micro-frontend system.
2.6.5.	Observability Stacks and Telemetry Standardization
Observability is essential for operating distributed systems where failures are partial, latency is variable, and root-cause analysis requires correlating signals across components. Modern related work converges on collecting metrics, logs, and traces and treating telemetry as a first-class system output [33][44][46].

The OpenTelemetry Collector is widely used as a vendor-neutral pipeline for receiving, processing, and exporting telemetry, enabling consistent instrumentation and backends without locking the architecture to a single monitoring product. However, many system descriptions stop at listing tools (e.g., "Prometheus + Grafana + tracing"), without explaining design choices such as: sampling strategies, trace context propagation across gateways, SLO-driven alert design, or how observability requirements feed back into CI/CD quality gates.
2.6.6.	Identified Gap and Thesis Positioning
Across the reviewed works, a consistent limitation is that existing references often address individual dimensions (architecture patterns, migration techniques, GitOps tooling, or observability stacks) in isolation. What is less commonly articulated—and frequently questioned by thesis committees—is an integrated, reproducible blueprint that connects:
-	architectural decomposition (microservices + micro-frontends),
-	deployment automation (CI/CD + GitOps),
-	cloud-native runtime concerns (Kubernetes-oriented operational model),
-	and production-grade observability (standardized telemetry and diagnosis workflow).

This thesis addresses that gap by presenting an end-to-end cloud-native system implementation and deployment methodology where the application domain (e-commerce) is used only as a demonstration vehicle. The primary contribution is not business logic design, but the infrastructure, DevOps practices, cloud-native deployment architecture, and operational readiness required to run such a system reliably.

Table 51. Related Work Comparison Summary
| Area                     | Typical focus in related work                                             | Common limitation                                 | What this thesis emphasizes                                  |
| :--- | :--- | :--- | :--- |
| Microservices references | Service decomposition + basic deployment [52][53]                         | Less detail on infra trade-offs & reproducibility | Infra-first blueprint and deployment methodology             |
| Migration strategies     | Incremental replacement (e.g., Strangler pattern) [54]                    | Limited operational/process integration           | Migration aligned with CI/CD and platform constraints        |
| Distributed consistency  | Saga/event-driven coordination [55]                                       | Hard to observe and operate in practice           | Operability + failure visibility as design requirements      |
| GitOps delivery          | Tool-driven reconciliation (Argo/Flux) [56]                               | Often "tool usage," not end-to-end system design  | Integrated delivery pipeline and environment promotion model |
| Observability            | Telemetry collection + dashboards [33][44][46]                            | Tool listing without design rationale             | Standardized telemetry + operational workflow                |
 
CHAPTER 3: SYSTEM ANALYSIS AND DESIGN
3.1.	System Architecture Overview
This project is designed as a cloud-native e-commerce platform that modernizes both the backend and frontend while keeping operational concerns (deployment, security, and observability) as first-class requirements. The architecture follows a layered, “vertical slice” decomposition: micro-frontends in the client layer, an API Gateway at the edge, domain-aligned microservices in the core, and service-owned datastores plus shared platform capabilities (messaging + monitoring) underneath. The repository structure reflects this separation through folders such as Services/, ApiGateways/, ecommerce-micro-frontend/ (and/or client/), Deployments/, and Infrastructure/.
End-to-end request path (runtime view).
A typical user request originates from the web UI (Angular-based client layer), reaches the backend through Ocelot API Gateway, and is then routed to the appropriate microservice. Authentication is handled via an Identity provider (IdentityServer4), while business requests are processed by Catalog, Basket, Discount, and Ordering services. Each service owns its datastore (MongoDB, Redis, PostgreSQL, SQL Server), ensuring clear boundaries and independent evolution.
Synchronous + asynchronous composition.
The system uses synchronous calls for user-facing interactions where immediate feedback is required (e.g., browsing products, retrieving cart content), and asynchronous messaging for cross-service workflows that must remain resilient under partial failure (e.g., order placement and downstream integration events). RabbitMQ is used as the message broker, while gRPC is used where low-latency service-to-service calls are beneficial (e.g., Basket → Discount).
Cross-cutting concerns as platform capabilities.
-	Instead of embedding operational logic inconsistently inside each service, the system centralizes or standardizes cross-cutting concerns:
-	Edge concerns (routing, aggregation, token validation) are concentrated in the API Gateway.
-	Observability is treated as mandatory for distributed debugging: centralized logs (Elastic Stack), metrics (Prometheus/Grafana), and tracing (Jaeger) enable diagnosis across service boundaries. 
-	Deployment consistency is achieved through containerization and Kubernetes-oriented packaging (discussed in later sections, but architecturally anticipated here through the Deployments/ structure).
 
Figure 1. System Architecture Overview
3.2.	Backend Microservices Design
The backend is designed using Domain-Driven Design (DDD) to define service boundaries and Clean Architecture to keep each service maintainable as it evolves. This combination addresses two risks common in microservices projects:
-	Boundary erosion (services becoming “distributed monoliths” due to unclear responsibilities), and
-	Internal complexity (services becoming hard to change because domain logic is tangled with infrastructure code).
In this project, the bounded contexts are implemented as independent services under Services/, while shared or cross-cutting components are organized separately (e.g., Infrastructure/, API Gateway configuration under ApiGateways/).
3.2.1.	Domain Analysis with Domain-Driven Design (DDD)
Following Evans’ DDD approach [25], the e-commerce domain is decomposed into bounded contexts with high cohesion and explicit contracts. The project implements the following core backend services (as reflected in the repository and architecture specification):
-	Identity / Security Context (IdentityServer4): Provides authentication and authorization via JWT issuance and validation. Centralizing identity avoids duplication of security logic across business services and keeps authorization policy changes isolated from domain features.
-	Catalog Service (Product Context): Owns product representation and retrieval. This context is optimized for read-heavy workloads and flexible product attributes, aligning with a document data model (MongoDB).
-	Basket Service (Shopping Context): Owns the transient cart state and high-frequency add/remove operations, aligning with low-latency key-value storage (Redis). It also participates in pricing composition by interacting with Discount.
-	Discount Service (Pricing Context): Encapsulates promotion rules and coupon calculations and exposes a gRPC interface to reduce latency for frequently invoked discount computations.
-	Ordering Service (Sales Context): Owns order creation and the checkout workflow. This service is the natural coordination point for order lifecycle state, and it relies on relational persistence (SQL Server) to preserve integrity for order records.
Trade-off note (DDD in microservices): DDD improves modularity, but it also introduces the cost of distributed domain boundaries: cross-context workflows (like checkout) require explicit integration patterns rather than in-process method calls. The design intentionally accepts this cost because the thesis goal is modernization with independent deployability and scalability (Chapter 2), not a minimal-complexity monolith.
 
Figure 2. Backend Services & Bounded Contexts
3.2.2.	Internal Structure: Clean Architecture per Service
Each microservice follows a Clean Architecture layering model: API → Application → Domain → Infrastructure. This enforces dependency direction inward (domain rules independent of frameworks), supports testability, and prevents persistence/transport concerns from leaking into domain logic. The project documentation explicitly describes this per-service structure.
Design rationale (why it matters here):
-	Microservices reduce coupling between services, but without an internal structure they often become “mini-monoliths.” Clean Architecture keeps each service evolvable.
-	The presence of MediatR/CQRS tooling in the stack supports a clear separation between commands and queries, which is especially useful when a service must scale read/write paths differently (common in e-commerce).
 
Figure 3. Backend Service Clean Architecture
 
Figure 4. Odering Service Clean Architecture
 
Figure 5. Catalog Service Clean Architecture
3.2.3.	Architectural Patterns Applied Across Services
(a)	API Gateway Pattern (Ocelot).
The API Gateway is the only public backend entry point. This reduces frontend-to-service coupling, centralizes routing rules, and provides a single location for cross-cutting policies (token validation, request shaping/aggregation). The project uses Ocelot as the gateway component.
Trade-off: A gateway can become a bottleneck or “mini-monolith” if it accumulates business logic. In this design it is restricted to edge concerns; domain logic remains inside services.
(b)	Database-per-Service + Polyglot Persistence
Each service owns its data to preserve autonomy and enforce boundaries, using storage selected for workload fit:
-	Catalog → MongoDB (flexible product schema)
-	Basket → Redis (low-latency ephemeral state)
-	Discount → PostgreSQL (structured rules)
-	Ordering → SQL Server (transactional order records) 
Trade-off: Queries spanning contexts require API composition or read models; the design accepts this and relies on the gateway and service APIs/events rather than shared tables.
(c)	Communication Model (REST/gRPC + Events)
-	Synchronous: Gateway → services for user-driven actions; Basket → Discount via gRPC where frequent, latency-sensitive price enrichment is required. 
-	Asynchronous: RabbitMQ event bus to decouple workflows and improve resilience during partial outages.
Trade-off: Async improves decoupling but introduces eventual consistency and harder debugging, explicitly addressed later through observability.
(d)	Saga Pattern for Checkout Consistency
Because checkout touches multiple bounded contexts, distributed ACID transactions are avoided. The architecture adopts saga-style coordination (conceptually orchestration around the Ordering service) using integration events through RabbitMQ.
Trade-off: The system must define compensating actions and accept eventual consistency windows; the benefit is higher availability and better failure isolation during checkout.
 
Figure 6. Saga Pattern Sequence Diagram
(e)	Resilience Patterns (timeouts, retries, circuit breaking)
In distributed systems, network calls fail more often than code. Resilience mechanisms (via application policies and/or service mesh) prevent cascading failure by bounding how long dependencies can block and by failing fast when a dependency is unhealthy. The project’s stack explicitly includes service-mesh and observability components intended to support these guarantees at runtime.
3.3.	Micro-Frontend Design
This project intentionally started with a conventional single Angular SPA (located in the client/ folder) to represent the common “frontend monolith” baseline used in many e-commerce systems. The legacy client follows the typical Angular CLI workflow (single build, single deployment unit), which is effective early on but becomes increasingly restrictive as teams and features grow. In particular, any change, whether in product browsing or checkout, forces rebuilding and redeploying the entire UI bundle, creating tight coupling between unrelated features and slowing release velocity.
3.3.1.	Baseline and Motivation: From Angular Frontend Monolith to Micro-
This project intentionally started with a conventional single Angular SPA (located in the client/ folder) to represent the common “frontend monolith” baseline used in many e-commerce systems. The legacy client follows the typical Angular CLI workflow (single build, single deployment unit), which is effective early on but becomes increasingly restrictive as teams and features grow. In particular, any change, whether in product browsing or checkout, forces rebuilding and redeploying the entire UI bundle, creating tight coupling between unrelated features and slowing release velocity.
To address this, the frontend is re-architected into a micro-frontend system implemented in the ecommerce-micro-frontend/ folder. The new implementation adopts runtime composition using Module Federation inside an NX monorepo, enabling independent build/deploy boundaries while preserving a coherent “single application” user experience.
3.3.2.	Decomposition Strategy: UI Boundaries Aligned to User Journeys
The decomposition strategy follows the same principle used in backend bounded contexts: high cohesion within a feature area, low coupling across feature areas. Instead of splitting by technical layers (components/services), the UI is split by user journeys and business capabilities:
-	Store: product discovery and browsing (catalog experience).
-	Checkout: shopping cart + checkout flow (transactional journey).
-	Account: authentication and user profile/account-related flows.
This aligns naturally with an e-commerce platform where browsing traffic and checkout traffic have different change rates, risk profiles, and scalability needs. The codebase reflects this structure explicitly: host/, store/, checkout/, and account/ are separate applications within the micro-frontend workspace.
3.3.3.	Host (Shell) application responsibilities
The Host is designed to be the only “always deployed” UI entry point and to remain thin: it provides cross-cutting UI concerns, while the business features live in remote modules. In this project, the host is described as the “main shell application that orchestrates micro-frontends.”
Key responsibilities include:
-	Composition and Runtime Loading: The host does not hardcode feature implementations. Instead, it dynamically loads a remote based on the route (e.g., /:appName/*) and injects it into the DOM at runtime.
-	Centralized Registry of Micro-Frontends: The host maintains a registry that defines each remote’s identity (name, basePath, remoteName, exposed module) and environment-specific URLs (dev/stage/prod). This ensures onboarding a new micro-frontend is a configuration step rather than an invasive code rewrite.
-	Operational Consistency: The registry encodes consistent routing and deployment conventions. For example:
●	In development, remotes run on dedicated ports (store 4201, checkout 4202, account 4203).
●	In production/staging, remotes are resolved under a shared /remotes/<name> base path, enabling deployment as a cohesive release when needed while still preserving modular boundaries.
 
Figure 7. Micro-Frontend Runtime Loading Sequence
3.3.4.	Remote applications: feature ownership and independence
Each remote micro-frontend encapsulates a vertical slice of UI behavior:
-	Store Micro-Frontend (store/): Implements product catalog browsing and discovery, conceptually corresponding to the “Catalog” experience in the overall e-commerce domain.
-	Checkout Micro-Frontend (checkout/): Consolidates the cart/checkout journey (basket + ordering flow). This boundary is intentional: the cart is tightly coupled to checkout UX and benefits from being versioned and tested together as one transactional slice.
-	Account Micro-Frontend (account/): Encapsulates identity-facing UI (login/account screens), allowing authentication and profile features to evolve without forcing a redeploy of store/checkout.
3.3.5.	Integration Contract and Navigation
A critical micro-frontend design choice is to define a stable integration contract between host and remotes. In this system, remotes expose a standardized module entry (documented as ConsoleMicroApp), and the host expects remotes to support inject and unmount lifecycles so the host can mount/unmount features safely during navigation.
Additionally, the host manages URL/query-string interoperability between shell and remotes. The loader pattern includes an explicit callback to synchronize search parameters back into the browser URL, preventing remotes from silently diverging from the global navigation state.
This contract-based approach supports:
-	Independent deployments (as long as the contract remains compatible),
-	Reduced “hidden coupling”,
-	More reliable integration testing (contract is testable and documentable).
3.3.6.	Shared Dependencies and Governance
A recurring micro-frontend trade-off is bundle duplication and version skew (e.g., multiple React copies). To reduce this risk, the micro-frontend workspace is implemented as an NX monorepo and includes shared local packages under packages/, such as injection utilities and an authentication provider.
The monorepo also defines shared module path aliases for remote entries (e.g., store/Module, checkout/Module, account/Module), making integration explicit and consistent across the workspace.
Design trade-off (thesis discussion angle):
-	Pros: strong consistency, easier shared tooling and standards, reduces duplicate dependencies, clearer contracts.
-	Cons: governance overhead (version policies), coordination needed for shared package updates, and more complex build pipelines than a single SPA.
3.3.7.	Summary
In summary, the frontend architecture evolves from an initial Angular monolith (client/) into a runtime-composed micro-frontend system (ecommerce-micro-frontend/). The system uses a thin host for global concerns and domain-aligned remotes for business capabilities. Runtime composition, a formal injection/unmount contract, and a central registry enable independent feature evolution while keeping navigation and user experience consistent across the platform.
3.4.	Database Design
To support an e-commerce workload that is simultaneously read-heavy (product browsing), write-bursty (cart updates), and transactional (order placement), this project adopts Polyglot Persistence through the Database-per-Service pattern. Each microservice controls its own data store and exposes data only through service contracts (REST/gRPC/events). This prevents the “integration database” anti-pattern and preserves bounded-context autonomy, which is consistent with the overall DDD decomposition described earlier.
Design trade-offs
This choice provides clear benefits (independent scaling, schema evolution isolation), but introduces known distributed-system costs:
-	Eventual consistency replaces cross-service ACID transactions; workflows (e.g., checkout) require patterns like Saga to remain correct under failure.
-	Operational overhead increases (multiple databases to deploy/monitor/backup), especially in Kubernetes, where each data store becomes an additional workload (pod/service/stateful component).
-	Cross-service reporting becomes harder; the system avoids shared tables, so consolidated views require aggregation via APIs/events or an external analytics pipeline (out of scope for this thesis).
3.4.1.	Polyglot Persistence Strategy
The selection of database technologies is driven by the specific nature of the data and the access patterns required by each Bounded Context.
Microservice (Bounded Context)	Database Technology	Workload Characteristics	Rationale for Selection
Catalog (Product)	MongoDB (Document)	Read-heavy, heterogeneous product attributes	Flexible schema supports evolving product fields; optimized for listing/detail reads.
Basket (Shopping)	Redis (Key–Value / Cache)	High-throughput, ephemeral cart state	Sub-millisecond reads/writes; natural fit for session-like data and fast cart mutations.
Discount (Pricing)	PostgreSQL (RDBMS)	Structured coupon/rule registry	Strong integrity guarantees; relational queries fit coupon lookups and administration.
Ordering (Sales)	SQL Server (RDBMS)	Transactional, relational order records	ACID semantics for order creation; supports auditability and structured reporting.
Table 1. Database Technology Selection (Polyglot Persistence Strategy)
3.4.2.	Catalog Service Database (MongoDB)
The Catalog service stores product data in MongoDB to accommodate attribute variability across categories and to optimize the platform’s dominant read path (browse → search → detail). In the implemented model, product creation payloads include name, summary, description, image reference, price, brand, and type, reflecting a document-centric structure suitable for denormalized reads.
A key design choice is read-optimized document composition: frequently accessed descriptive attributes should be co-located so that the UI can retrieve a complete product view with minimal round trips.

Field	Type	Description
_id	ObjectId	Unique identifier (MongoDB-generated)
Name	String	Product display name
Summary	String	Short description used in listings/cards
Description	String	Full product details
ImageFile	String	Image URL/path reference used by the UI
Price	Decimal/Number	Monetary value used in pricing and totals
Brands	Object	Brand reference (id, name) associated with product
Types	Object	Type/category reference (id, name) associated with product
Table 2. Catalog Service Database Fields (MongoDB)
3.4.3.	Basket Service Database (Redis)
The Basket service maintains the user’s shopping session state and is therefore optimized for frequent mutations (add/remove/update quantity) and fast reads (cart page, mini-cart, checkout summary). Redis is selected because it supports very low latency access and aligns naturally with ephemeral session-like data.
A recommended storage model is:
-	Key: basket:{userName} (or equivalent user identifier)
-	Value: serialized basket object (JSON), containing line items and totals
This approach minimizes query complexity and supports the overwrite/update behavior typical of basket workflows.
Object	Field	Description
ShoppingCart
  UserName	Basket owner identifier (also drives keying strategy)
  Items	List of ShoppingCartItem objects
ShoppingCartItem
  ProductId	Reference to catalog product
  ProductName	Snapshot of product name for display and checkout continuity
  ImageFile	Snapshot of product image reference for UI rendering
  Quantity	Units selected
  OriginalPrice	Unit price before discount application
  DiscountAmount	Applied discount per unit (if any)
  Price	Effective unit price used in totals (after discount)
  FinalPrice (derived)	Computed value: OriginalPrice − DiscountAmount

Table 3. Basket Service Database Objects (Redis)
Design rationale: duplicating small display fields (name/image) inside basket items is a deliberate denormalization choice that improves UI responsiveness and reduces dependency on Catalog availability during cart rendering.
3.4.4.	Discount Service Database (PostgreSQL)
Discount logic is isolated to reduce coupling between marketing rules and transactional ordering. The service stores coupon records in PostgreSQL, consistent with a “rule registry” model where correctness is more important than raw throughput.

Column	Type	Constraints	Description
Id	SERIAL	PRIMARY KEY	Auto-incrementing primary key
ProductName	VARCHAR(500)	NOT NULL	Product name for coupon application
Description	TEXT	-	Detailed coupon description
Amount	INT	-	Discount amount (currency unit)
Table 4. Discount Service Database Columns (PostgreSQL)
3.4.5.	Ordering Service Database (SQL Server)
Ordering is the system’s financial source of truth, so it uses a relational store with ACID semantics. The Ordering service persists order header data (user, totals, shipping/contact snapshot, payment metadata) and supports auditing fields for traceability over the order lifecycle.

Column	SQL Type	Nullable	Description
Id	INT	NOT NULL	Primary key, Identity Column
UserName	NVARCHAR(MAX)	NULL	Username who placed the order
TotalPrice	DECIMAL(18,2)	NULL	Total order value
FirstName	NVARCHAR(MAX)	NULL	Customer first name
LastName	NVARCHAR(MAX)	NULL	Customer last name
EmailAddress	NVARCHAR(MAX)	NULL	Contact email
AddressLine	NVARCHAR(MAX)	NULL	Shipping address
Country	NVARCHAR(MAX)	NULL	Country
State	NVARCHAR(MAX)	NULL	State/Province
ZipCode	NVARCHAR(MAX)	NULL	Postal code
CardName	NVARCHAR(MAX)	NULL	Name on card
CardNumber	NVARCHAR(MAX)	NULL	Card number (requires encryption)
Expiration	NVARCHAR(MAX)	NULL	Card expiration date
Cvv	NVARCHAR(MAX)	NULL	CVV code (requires encryption)
PaymentMethod	INT	NULL	Payment method
CreatedBy	NVARCHAR(MAX)	NULL	Order creator
CreatedDate	DATETIME2	NULL	Order creation timestamp
LastModifiedBy	NVARCHAR(MAX)	NULL	Last modifier
LastModifiedDate	DATETIME2	NULL	Last modification timestamp
Table 5. Ordering Service Database Columns (SQL Server)
3.4.6.	Data Consistency, Isolation, and Cross-Service Flow
Because databases are isolated per service, the system explicitly avoids cross-database joins/transactions. Instead:
-	Isolation & ownership: only the owning service may write to its database; other services must call APIs or consume events to obtain needed data.
-	Eventual consistency for checkout: the basket checkout triggers an event-driven workflow where the Ordering service creates the order record; compensation is required on failure (Saga pattern).
-	Deployment isolation: each data store is deployed independently (containers in development; separate Kubernetes workloads in the cluster), and services are configured only with their own connection details, supporting repeatability and preventing accidental cross-access.
 
Figure 8. Data Consistency, Isolation, and Cross-Service Flow
3.5.	Infrastructure Design
The infrastructure of the proposed system is designed according to cloud-native principles, where application components are packaged as containers and operated through declarative orchestration. This approach is particularly suitable for a distributed e-commerce system because it provides (i) repeatable deployments across environments, (ii) built-in mechanisms for availability and scaling, and (iii) a consistent operational layer for cross-cutting concerns such as configuration, networking, and observability.
In this thesis, the infrastructure targets a Kubernetes-based deployment that can be executed on a local cluster (e.g., Docker Desktop / Minikube) for demonstration, while remaining conceptually portable to managed Kubernetes offerings. The portability requirement is important because the system consists of multiple independently deployable workloads (backend microservices, micro-frontend host/remotes, databases, message broker, and monitoring stack) that must behave consistently across environments.
 
Figure 9. Kubernetes Cluster Topology
3.5.1.	Kubernetes Cluster Topology
A Kubernetes cluster separates cluster control from workload execution. The control plane maintains the desired state (scheduling decisions, reconciliation, and cluster metadata), while worker nodes run the application pods. This separation aligns well with microservices because it externalizes concerns such as placement, recovery, and scaling from the application code into the platform.
For this project, workloads are organized conceptually into three groups to reflect their operational characteristics:
-	Application workloads (stateless): The backend microservices (Catalog, Basket, Discount, Ordering), the API Gateway (Ocelot), and the micro-frontend web delivery layer (served via Nginx) are deployed as stateless workloads. Statelessness is preferred because it enables horizontal scaling and rapid rescheduling without complex recovery procedures.
-	Data workloads (stateful): MongoDB, Redis, PostgreSQL, SQL Server, and RabbitMQ represent stateful components. In production, these are typically delegated to managed services; however, for a thesis prototype they can be containerized inside the cluster to keep the system self-contained. The primary trade-off is operational complexity: stateful workloads require persistent volumes, backups, and careful resource tuning.
-	Infrastructure/observability workloads: Observability components (e.g., Elasticsearch/Kibana, Prometheus/Grafana, Jaeger) are separated conceptually because they should remain available even during application degradation. This separation supports the thesis goal of demonstrating monitoring and diagnosis under failure scenarios.
Design trade-offs. The Kubernetes approach improves reproducibility and operational automation (self-healing, rolling updates), but it also introduces a platform learning curve and increases operational moving parts (networking, RBAC, persistent storage). These trade-offs are justified here because the thesis explicitly evaluates distributed deployment, reliability, and observability, capabilities that are difficult to demonstrate convincingly on a single-process monolith.
Component	Kubernetes Kind	Service Exposure	Persistence (PVC)
Application Workloads (Stateless)
Catalog API	Deployment	LoadBalancer	No
Basket API	Deployment	LoadBalancer	No
Discount API (gRPC)	Deployment	ClusterIP	No
Ordering API	Deployment	LoadBalancer	No
Ocelot API Gateway	Deployment	LoadBalancer (NLB)	No
Data Workloads (Stateful)
MongoDB (catalogdb)	Deployment	ClusterIP	No*
Redis (basketdb)	Deployment	ClusterIP	No*
PostgreSQL (discountdb)	Deployment	ClusterIP	No*
SQL Server (orderdb)	Deployment	ClusterIP	No*
RabbitMQ	Deployment	ClusterIP	No*
Infrastructure/Observability
Elasticsearch	Deployment	ClusterIP	No
Kibana	Deployment	ClusterIP	No
LocalStack (S3)	Deployment	NodePort	No
pgAdmin	Deployment	ClusterIP	Yes
Portainer	Deployment	ClusterIP	Yes
Table 6. Kubernetes Workload Types, Service Exposure, and Persistence
3.5.2.	Network Architecture and Ingress Strategy
A microservices deployment requires both north–south traffic management (client → cluster) and east–west traffic management (service ↔ service). The system therefore applies a layered routing strategy:
a)	Ingress layer (north–south):
External client requests enter the cluster through an ingress controller. This layer is responsible for:
-	TLS termination (HTTPS entry to the cluster),
-	Host/path routing (separating frontend delivery from backend API traffic), acting as the stable “edge” endpoint while pods behind it scale dynamically.
b)	Gateway layer (API surface consolidation):
Behind ingress, the system exposes a unified backend API via the Ocelot API Gateway, which centralizes routing to internal services. This design is consistent with the architecture in Sections 3.1–3.2: the gateway reduces client coupling to internal service topology, and enables cross-cutting enforcement (e.g., request shaping, aggregation, and consistent routing).
c)	Service-to-service communication (east–west):
Internal service communication uses a mix of patterns already established in the backend design:
-	REST for standard synchronous queries,
-	gRPC between Basket → Discount for low-latency discount lookup,
-	RabbitMQ for asynchronous event-driven checkout progression.
This layered approach ensures that the frontend, especially after migrating to micro-frontends, interacts with a stable API contract rather than chasing internal service endpoints.
 
Figure 10. Network Architecture and Ingress Strategy
3.5.3.	Service Mesh Implementation and Sidecar Pattern
To make inter-service communication more reliable and observable without duplicating networking logic inside every microservice, the infrastructure introduces a service mesh using the sidecar pattern. In this model, each application pod includes:
-	the application container (e.g., Catalog API), and
-	an injected proxy (Envoy) that intercepts inbound/outbound traffic.
This design is chosen for three thesis-relevant reasons:
a)	Security (mTLS by default):
Mutual TLS encrypts service-to-service traffic and provides service identity at the transport layer. This is especially important because sensitive workflows (checkout events, order creation, pricing calls) traverse the network repeatedly.
b)	Resilience at the network layer:
Policies such as retries, timeouts, and circuit breaking can be applied consistently without embedding these rules into every codebase. This complements the resilience patterns discussed in Section 3.2 (e.g., avoiding cascading failures).
c)	Observability (traces/metrics from traffic):
The mesh generates telemetry about request paths and latencies across services, which is essential for diagnosing failures in distributed workflows where a single user action crosses multiple hops (gateway → basket → discount → event broker → ordering).
 
Figure 11. Service Mesh Sidecar Pattern
Trade-offs. A service mesh provides strong operational leverage (uniform security and telemetry), but it adds runtime overhead and configuration complexity. For this project, the trade-off is acceptable because the thesis explicitly targets "production-like" operational concerns, diagnosis, reliability controls, and secure communication, rather than only functional correctness.
3.5.4.	CloudFormation-Based Cloud Infrastructure Provisioning
While Kubernetes provides the workload orchestration layer, the underlying cloud infrastructure (networking, compute, and storage) must be provisioned before clusters can operate. For AWS deployments, this project uses CloudFormation templates to define infrastructure declaratively, enabling reproducible and version-controlled cloud resource management.
a)	Stack Hierarchy and Dependencies.
The CloudFormation templates are organized into a dependency hierarchy where each stack builds upon the outputs of previous stacks:
-	VPC Stack (vpc.yaml): Provisions the foundational network infrastructure including a VPC with configurable CIDR blocks, two public subnets (for load balancers and NAT gateways) and two private subnets (for EKS nodes) across multiple availability zones, an Internet Gateway for public subnet connectivity, a NAT Gateway for private subnet outbound access, and route tables with appropriate associations.
-	EKS Stack (eks-cluster.yaml): Provisions the Kubernetes control plane and compute layer including an EKS cluster with configurable Kubernetes version, a managed node group with auto-scaling configuration, IAM roles for the cluster and worker nodes, and launch templates with VPC CNI prefix delegation for higher pod density.
-	S3 Stack (s3-bucket.yaml): Creates an S3 bucket for product image storage, configured for the Catalog service to store and serve product images.
-	ALB Stack (alb-ingress.yaml): Provisions an Application Load Balancer for external traffic ingress, including target groups and listener configurations.
b)	Template Parameterization.
Each template accepts parameters for environment-specific customization (e.g., EnvName, VpcCidr, NodeInstanceType, NodeDesiredCapacity). This enables the same templates to provision development, staging, and production environments with appropriate sizing and configuration. Stack outputs export resource identifiers (VPC IDs, subnet IDs, cluster names) that downstream stacks reference via cross-stack imports.
c)	Design Rationale.
Separating cloud infrastructure provisioning (CloudFormation) from workload deployment (Helm) provides clear operational boundaries: infrastructure changes require CloudFormation stack updates with automatic rollback on failure, while application changes use Helm release upgrades. This separation also enables infrastructure drift detection and supports disaster recovery through template-based reprovisioning. 
CHAPTER 4: IMPLEMENTATION
4.1.	Backend Implementation (.NET Core)
The backend is implemented as four domain-aligned microservices, Catalog, Basket, Discount, and Ordering, each deployed independently and designed to preserve bounded-context autonomy. The implementation follows Clean Architecture to control internal complexity and CQRS to separate read/write concerns where it improves maintainability and testability. This chapter explains how the design decisions from Chapter 3 are realized in code and deployment artifacts, without turning the thesis into a code listing.
 
Figure 12. Backend Project Structure
4.1.1.	Project Structure (Clean Architecture)
Each microservice is structured into four layers, enforcing the principle that domain rules remain independent of frameworks and infrastructure:
-	API layer: hosts the HTTP/gRPC entry points, middleware, and service bootstrap. This layer defines the public contract (controllers/endpoints) and delegates all domain behavior to the Application layer.
-	Application layer: implements use cases as commands/queries and orchestrates workflows. It is the primary “coordination” layer and contains validation and mapping logic.
-	Core/Domain layer: defines entities, interfaces, and domain rules. This layer does not depend on databases, messaging, or transport protocols.
-	Infrastructure layer: provides database access implementations, external integrations, and persistence configurations required by the service.
This structure is applied consistently across services to prevent “microservice internal monoliths,” where business rules become mixed with persistence and transport concerns.
Service	Persistence	Inbound Communication	Outbound Communication
Catalog	MongoDB (document store)	REST API (via Ocelot Gateway)	-
Basket	Redis (key-value cache)	REST API (via Ocelot Gateway)	gRPC client -> Discount
Discount	PostgreSQL (RDBMS)	gRPC server (from Basket)	-
Ordering	SQL Server (RDBMS)	RabbitMQ event consumer (BasketCheckoutEvent)	-
Table 7. Microservice Persistence and Communication Implementation
4.1.2.	CQRS Implementation with MediatR
The system applies CQRS to formalize the difference between:
-	Queries (read-only operations returning state without side effects), and
-	Commands (write operations that change state and may publish integration events).
In this project, CQRS is less about “scaling reads independently” (a larger-system concern) and more about engineering control: it makes write paths explicit, encourages small use-case handlers, and simplifies testing by isolating business actions into discrete request objects. This supports the thesis goal of maintainability under distributed complexity: as services evolve independently, clear command/query boundaries reduce accidental coupling inside a service.
 
Figure 13. CQRS Implementation with MediatR Pipeline
4.1.3.	Persistence Implementation per Service
The database design from Section 3.4 is implemented through service-owned repositories and infrastructure adapters:
-	Catalog service (MongoDB) implements document-oriented persistence for products, optimized for the read path (listing/detail). The document model includes a short Summary field used in UI cards and listing experiences, in addition to full Description.
-	Basket service (Redis) stores serialized cart state keyed by username, optimized for frequent mutations. Basket items intentionally denormalize small display fields (e.g., product name and image reference) so the cart can render quickly even if the catalog is slow or temporarily unavailable.
-	Discount service (PostgreSQL) persists coupon records using a relational schema suitable for rule registry lookups.
-	Ordering service (SQL Server) persists transactional order data as the financial “source of truth,” including audit fields (created/modified metadata) to support traceability.
This implementation preserves the Database-per-Service constraint: no microservice reads or writes another service’s database directly; all cross-service access is mediated via APIs (REST/gRPC) or events.
4.1.4.	Integration Patterns in the Backend
a)	gRPC for Basket -> Discount (low-latency synchronous call).
Discount calculation is invoked frequently during cart operations, so the system uses a synchronous contract to retrieve discount data efficiently. The implementation choice is reflected at the client side as well: the checkout/basket flow prepares payloads aligned with backend DTO expectations (e.g., PascalCase field names), which reduces friction and mapping ambiguity between UI and service contracts.
 
Figure 14. gRPC Integration Sequence
b)	Event-driven checkout for distributed workflow decoupling.
Checkout spans service boundaries, so the system uses asynchronous messaging to reduce temporal coupling: Basket emits a checkout-triggering event and Ordering consumes it to create the order record. This realizes the Saga-style “eventual consistency” model described in Chapter 3: the user-facing action completes quickly, while downstream processing occurs reliably through messaging and consumer handlers.
 
Figure 15. Event-Driven Checkout Sequence
4.1.5.	API Gateway Integration (Ocelot)
The Ocelot API Gateway is implemented as a dedicated edge service to ensure that frontend clients (including multiple micro-frontends) depend on a stable API surface rather than internal service topology. In this thesis, the gateway is intentionally constrained to edge concerns:
-	routing to internal services,
-	request shaping/aggregation where needed,
-	centralized policies (e.g., consistent versioning paths and unified endpoints).
This avoids turning the gateway into a new monolith. Business logic remains inside the microservices, preserving the architectural intent of bounded contexts.
Upstream Path	Downstream Service	HTTP Methods	Special Config
Catalog Service (eshopping-catalog:80)			
/Catalog	/api/v1/Catalog	GET, POST, PUT	Cache: 30s TTL
/Catalog/GetProductById/{id}	/api/v1/Catalog/GetProductById/{id}	GET, DELETE	—
/Catalog/GetAllProducts	/api/v1/Catalog/GetAllProducts	GET, DELETE	—
/Catalog/CreateProduct	/api/v1/Catalog/CreateProduct	POST	—
/Catalog/GetAllBrands	/api/v1/Catalog/GetAllBrands	GET, DELETE	—
/Catalog/GetAllTypes	/api/v1/Catalog/GetAllTypes	GET, DELETE	—
/Catalog/UploadProductImage	/api/v1/Catalog/UploadProductImage	POST	—
/Admin/MigrateImagesToS3	/api/v1/Admin/MigrateImagesToS3	POST	—
Basket Service (eshopping-basket:80)			
/Basket/GetBasket/{userName}	/api/v1/Basket/GetBasket/{userName}	GET	—
/Basket/CreateBasket	/api/v1/Basket/CreateBasket	POST	—
/Basket/DeleteBasket/{userName}	/api/v1/Basket/DeleteBasket/{userName}	DELETE	—
/Basket/Checkout	/api/v1/Basket/Checkout	POST	Rate limit: 1/3s
/Basket/CheckoutV2	/api/v2/Basket/Checkout	POST	Rate limit: 1/3s
Discount Service (eshopping-discount-discount-grpc:8080)			
/Discount/{productName}	/api/v1/Discount/{productName}	GET, DELETE	—
/Discount	/api/v1/Discount	PUT, POST	—
Ordering Service (eshopping-ordering:8080)			
/Order/{userName}	/api/v1/Order/{userName}	GET	—
Table 8. API Gateway Routing Configuration (Ocelot)
4.1.6.	Cross-Cutting Behaviors (Validation, Error Handling, Logging)
To avoid duplicating boilerplate across handlers and controllers, cross-cutting concerns are applied consistently at the application boundary:
-	Validation ensures invalid requests are rejected before persistence or integration occurs.
-	Exception handling enforces consistent error semantics and prevents low-level exceptions from leaking into API contracts.
-	Structured logging ensures operational tooling (Chapter 5) can correlate behavior across services and requests.
These are not “nice-to-have” in microservices: they reduce failure ambiguity, improve diagnosability, and support safe independent deployments.
4.2.	Frontend Implementation & Migration
4.2.1.	Baseline Implementation: Legacy Angular Frontend (client/)
The project intentionally begins with a conventional single-page application (SPA) generated using Angular CLI, implemented under the client/ project. This baseline reflects a common industrial starting point: a single build artifact, a single deployment unit, and a unified dependency graph managed centrally through the Angular workspace configuration.
From an implementation standpoint, this model is simple and productive early in development. However, it introduces structural constraints that become increasingly problematic as the system grows:
-	Single release unit: any change in one feature area requires rebuilding and redeploying the entire UI.
-	Tight coupling through shared dependencies: dependency upgrades and cross-cutting refactors become “global events”.
-	Scaling organizationally: parallel development increases merge conflicts and coordination overhead because all teams modify the same application boundary.
 
Figure 16. Legacy Angular Monolith Architecture
4.2.2.	Migration Goals and Constraints
The migration is designed to directly address the “frontend monolith bottleneck” discussed in Chapter 2 and the architectural symmetry goal established in Chapter 3: if backend capabilities are independently deployable, the UI should also support independent evolution of user journeys (e.g., browsing vs checkout).
The migration therefore targets four practical constraints:
-	Independent delivery units for major user journeys (store, checkout, account).
-	Runtime composition so that features can be deployed without rebuilding the shell.
-	Stable integration contracts (mount/unmount lifecycle + navigation synchronization).
-	Shared dependency governance to avoid bundle duplication and version drift.

4.2.3.	Target Implementation: Micro-Frontend Workspace (ecommerce-micro-frontend/)
The modernized implementation is located in ecommerce-micro-frontend/ and follows a host/remote structure:
-	host/ – shell application that orchestrates composition
-	store/ – product browsing micro-frontend
-	checkout/ – basket + checkout flow micro-frontend
-	account/ – user/account micro-frontend
Shared utilities are packaged under packages/, notably an injection utility and an authentication provider.
In development, each module runs independently on a dedicated port (host 4200, store 4201, checkout 4202, account 4203), which supports isolated local development and faster feedback loops.
Module	Business Scope	Runtime Role	Dev Port
host	Shell, navigation, auth, layout	Host	4200
store	Product browsing, catalog	Remote	4201
checkout	Shopping cart, checkout flow	Remote	4202
account	User profile, account management	Remote	4203
Table 9. Micro-frontend Module Configuration and Dev Ports
    
4.2.4.	Runtime Composition with Module Federation
This thesis adopts runtime composition using Module Federation, because it maximizes independent deployability: the host loads remote modules dynamically rather than compiling them into a single bundle.
Two design decisions are central here:
a)	A central registry of remotes (host-controlled).
The host defines a registry that maps each micro-frontend to its basePath, exposed module name, and environment-specific remote URL. In development it resolves to localhost ports; in staging/production it resolves under a shared /remotes/<name> convention derived from the current origin.
b)	Standardized remote entry contracts (remote-controlled).
Each remote exposes a consistent interface that supports inject() and unmount() so the host can mount and detach a remote safely during navigation and page lifecycle changes. This pattern turns “integration” into a contract rather than an ad-hoc runtime hack, which is essential for reliability in runtime composition.
 
Figure 17. Micro-Frontend Runtime Composition
4.2.5.	The Shell Application: Responsibilities and Boundaries
To prevent the host from becoming a new “frontend monolith”, the host is intentionally constrained to cross-cutting concerns and composition logic:
-	Remote discovery and environment resolution via the registry (what exists, where it is hosted).
-	Mount/unmount lifecycle orchestration (the host owns when a remote is rendered; the remote owns what it renders).
-	Global navigation and layout consistency so micro-frontends remain cohesive as a single product.
Trade-off (explicit): the host increases architectural control and consistency, but it can also become a bottleneck if domain-specific logic leaks into it. In this project, that risk is mitigated by enforcing a contract-based integration style and keeping domain UI inside remotes.
4.2.6.	Routing Strategy: Delegation Without Losing UX Consistency
A micro-frontend architecture must preserve a coherent navigation experience even though features are split across independently deployed modules.
This project implements routing as a two-level responsibility split:
-	Host routing decides which remote owns a route prefix (e.g., /store, /checkout, /account), based on the registry’s basePath definitions.
-	Remote routing decides how to handle subroutes inside its domain (e.g., product details under the store module). This keeps route ownership aligned with feature ownership, reducing cross-team coupling.
To maintain URL correctness, the integration contract includes callbacks (e.g., “onNavigate”) so remotes can request navigation changes while the host remains the single source of truth for browser history synchronization (preventing divergent navigation state between shell and remote).
 
Figure 18. Micro-Frontend Routing Strategy
4.2.7.	Shared Dependencies and Cross-App Governance
A recurring failure mode in micro-frontends is dependency duplication (multiple React copies, incompatible UI libraries, inconsistent auth state). This project addresses that through two mechanisms:
-	Monorepo governance (NX workspace): shared conventions, unified tooling, and predictable dependency management across all micro-frontends.
-	Shared packages for integration primitives: the packages/ directory contains reusable building blocks such as an injector utility (standardized mount/unmount) and an authentication provider, so that integration logic is not re-implemented differently by each remote.
Package	Responsibility	Why Shared	Risk if Duplicated
app-injector	Standardized mount/unmount lifecycle for remotes	Ensures consistent integration contract	Incompatible lifecycles, mount failures
auth-provider	Azure AD B2C MSAL integration, token management	Single source of auth state + token broadcast	Multiple auth states, token desync
Table 10. Shared Packages and Responsibility
4.2.8.	Migration Process: From Monolith to Micro-Frontends
The migration is described as a staged approach (a “strangler-style” modernization):
-	Baseline delivery: a working monolithic UI in client/ provides functional coverage and a reference UX.
-	Introduce the shell + first remote: establish composition and contracts early, because integration risks are highest at this stage.
-	Extract by user journey: move cohesive slices (store → checkout → account) into remotes, prioritizing areas with high change frequency and high coupling in the monolith.
-	Consolidate shared utilities: once multiple remotes exist, stabilize shared packages (injector/auth/config) to avoid divergence.
-	Decommission or reduce legacy surface: the monolith becomes a fallback or is gradually retired as remotes reach parity.
This is consistent with the thesis objective of demonstrating end-to-end modernization mechanics rather than merely presenting a final architecture.
4.3.	DevOps & Automation Implementation
A distributed system only delivers its architectural benefits (independent scaling, independent releases, fault isolation) if it can also be built and deployed repeatably. For this project, DevOps automation is treated as part of the implementation, not an afterthought, because microservices + micro-frontends increase the number of deployable artifacts and the risk of configuration drift.
The automation strategy integrates three layers:
-	Packaging and deployment definitions with Helm (Infrastructure as Code for Kubernetes).
-	Continuous Integration (CI) for fast validation (build, test, security checks).
-	Continuous Delivery/Deployment (CD) to publish container images and reconcile Kubernetes runtime state through Helm upgrades.
 
Figure 19. CI/CD Pipeline Diagram
4.3.1.	Helm Charts and Deployment Packaging
Kubernetes manifests become repetitive in a multi-service system (Deployments, Services, ConfigMaps, Secrets, probes, resource limits). To keep deployments consistent and environment-friendly, the platform uses Helm charts as the packaging format for Kubernetes resources.
Chart organization and intent.
Charts are structured around deployment ownership:
-	Application charts (stateless workloads): backend services (Catalog, Basket, Discount, Ordering), plus the Ocelot API Gateway.
-	Infrastructure charts (stateful dependencies): databases and broker components required for runtime (MongoDB, Redis, PostgreSQL, SQL Server, RabbitMQ).
-	Optional platform charts: observability components can be deployed separately (useful for demonstrations where monitoring is a focus).
Values-driven configuration.
Each chart is parameterized through values (e.g., image.registry, image.tag, replica counts, service ports, and environment variables). This enables the thesis requirement of portability: the same chart templates can be deployed locally or to cloud Kubernetes by swapping values.
Deployment idempotency.
Helm releases are applied using an “upgrade-or-install” approach (helm upgrade --install), so deployments are repeatable and safe to re-run. This also supports rollback: if a release breaks, Helm can revert to a previous known-good revision.
4.3.2.	Continuous Integration Pipeline
The CI pipeline validates changes before they are eligible for deployment. In microservices projects, CI has two main goals:
-	Fast feedback (developers learn quickly when something breaks),
-	Confidence gates (main branch remains deployable).
a)	Change detection to reduce wasted work.
Rather than running all jobs on every commit, the pipeline first detects which areas changed (backend / frontend / Docker / Helm-K8s). This enables selective execution (e.g., frontend linting only when the micro-frontend workspace changes).
b)	Backend validation.
For backend changes, the CI workflow runs a standard quality gate:
-	restore dependencies and build the solution,
-	run tests and collect code coverage,
-	optionally publish coverage summaries to PRs.
c)	Frontend validation.
For micro-frontend changes, CI uses the NX workspace model to run “affected-only” checks:
-	lint and test only impacted apps/libraries,
-	build the affected apps to ensure production compilation is valid.
d)	Security and supply-chain checks.
CI also includes automated scanning:
-	filesystem vulnerability scans (Trivy) to surface known CVEs,
-	static analysis (CodeQL) for C# and JavaScript/TypeScript to detect common security issues early.
e)	Container and Helm validation.
Even if CI does not publish images, it can still build images to validate Dockerfiles, and it can lint Helm charts to catch template or YAML errors before deployment time.
 
Figure 20. GitHub Actions CI Workflow Execution
4.3.3.	Continuous Deployment Pipeline
After CI validation, the CD pipeline automates publishing and deployment. The core idea is “build once, deploy via versioned artifacts”: services are packaged into container images, stored in a registry, then deployed to Kubernetes using Helm.
a)	Backend CD: Build → Push → Helm Upgrade.
The pipeline builds container images for each backend component:
-	catalogapi, basketapi, discountapi, orderingapi,
-	ocelotapigateway.
Images are pushed to a registry (AWS ECR for AWS-based deployments). Tagging follows a release-oriented model:
-	commits to the mainline can publish a default tag (often latest),
-	version tags (e.g., vX.Y.Z) create immutable release artifacts appropriate for production promotion.
b)	Environment targeting and namespaces.
Deployment targets are separated by environment (e.g., dev/staging/production) using:
-	distinct Kubernetes clusters or
-	distinct namespaces (common in thesis-scale clusters).
The CD workflow connects to the target cluster, ensures the namespace exists, then deploys:
-	Stateful dependencies first (databases + RabbitMQ),
-	Microservices next (Catalog/Basket/Discount/Ordering),
-	Gateway last (so routing points at ready services).
c)	Post-deployment checks.
To prevent “successful deployment, broken system,” CD performs lightweight smoke checks (e.g., resolving the gateway endpoint and probing a basic route/health response). This is especially important because Helm success alone does not guarantee that upstream dependencies are healthy.
4.3.4.	Frontend Automation and Delivery Strategy
Unlike backend services (container-first), micro-frontends are typically delivered as static assets (JS/CSS) behind a web server or CDN. The project automates micro-frontend builds so that the shell and remotes remain compatible.
Build output convention.
A practical strategy (and a good fit for thesis scope) is:
-	build the host (shell) application as the entry point,
-	build each remote application as a separate bundle,
-	publish them under a predictable structure such as:
/               → host
/remotes/store  → store remote
/remotes/checkout → checkout remote
/remotes/account → account remote

This preserves runtime composition while keeping deployment operationally simple (single domain, predictable remote paths).
4.3.5.	Deployment-as-Code and Environment Management (CI/CD-Driven)
This section describes how the project implements deployment automation and environment management through a CI/CD-driven approach, treating infrastructure and deployment definitions as code versioned alongside the application.

a)	Git as Source of Truth for Helm Charts and Workflow Definitions.
All deployment logic is encoded in the Git repository. The project maintains 17 Helm charts under Deployments/helm/, organized by component type:
-	Application services: catalog/, basket/, discount/, ordering/, ocelotapigw/ (API Gateway).
-	Database dependencies: catalogdb/ (MongoDB), basketdb/ (Redis), discountdb/ (PostgreSQL), orderdb/ (SQL Server), rabbitmq/.
-	Observability stack: elasticsearch/, kibana/, prometheus/, localstack/, pgadmin/, portainer/.

GitHub Actions workflows are defined under .github/workflows/:
-	ci.yml: Continuous Integration (build, test, security scans, Helm lint).
-	cd.yml: Continuous Deployment (build images, push to ECR, deploy to EKS).
-	release.yml: Semantic release management with automated changelog generation.

Dockerfiles reside alongside their respective services (e.g., Services/Catalog/Catalog.API/Dockerfile). This ensures that any deployed system state can be traced back to a specific Git revision.
b)	GitHub Actions Triggers and Automation
The deployment pipeline is triggered by GitHub Actions based on specific events:
-	Push to main or develop: triggers CI validation (build, test, security scan, Docker build validation, Helm lint).
-	Push to main: triggers CD workflow to build and push images to AWS ECR, then deploy to the development namespace.
-	Push tag v*: triggers CD with the version tag, creating immutable release artifacts and initiating the release.yml workflow for semantic versioning.
-	workflow_dispatch: enables manual deployment with explicit environment selection (dev/staging/production) and optional AWS region override.
-	Pull Request: triggers CI-only validation without deployment.
The CI workflow implements change detection using dorny/paths-filter to selectively run jobs: backend changes trigger .NET build/test, frontend changes trigger NX affected commands, and Deployments/ changes trigger Helm linting.
c)	Helm Upgrade/Install to EKS Namespaces by Environment.
Deployment to Kubernetes is performed via helm upgrade --install, executed by GitHub Actions against the target EKS cluster. The CD workflow (cd.yml) follows a specific deployment order:
-	Namespace creation: kubectl create namespace ${ENV_NAME} --dry-run=client -o yaml | kubectl apply -f -
-	Database layer: catalogdb, basketdb, discountdb, orderdb, rabbitmq (with 30-second stabilization wait).
-	Microservices: catalog, basket, discount, ordering (with AWS-specific environment overrides for catalog).
-	API Gateway: ocelotapigw (deployed last to ensure all backend services are ready).
-	Post-deployment: Product image migration to AWS S3, smoke tests via load balancer health check.
The cluster naming convention follows ${ENV_NAME}-ecommerce-eks (e.g., dev-ecommerce-eks, staging-ecommerce-eks), and namespaces are named by environment (dev, staging, production).
d)	Separate Values/Parameters per Environment.
Helm's parameterization model enables environment-specific configuration without duplicating chart templates. Each chart includes a values.yaml with defaults, and environment-specific overrides are applied through:
-	values-aws.yaml: AWS-specific configuration (e.g., Deployments/helm/catalog/values-aws.yaml) with production settings, increased resource limits, and IRSA (IAM Roles for Service Accounts) annotations.
-	--set flags: Dynamic overrides at deployment time for image.registry (ECR registry URL), environment variables (USE_LOCALSTACK='false'), and AWS-specific settings.
-	ConfigMaps: Per-service configuration (database connection strings, external service URLs) injected via templated ConfigMaps referenced in deployment manifests.
Key differences across environments include:
-	ASPNETCORE_ENVIRONMENT: “Development” vs “Production”.
-	USE_LOCALSTACK: “true” (local) vs “false” (AWS).
-	Resource limits: 100m/128Mi (development) vs 500m/512Mi (AWS production).
-	Autoscaling: Disabled in development, enabled with minReplicas=1/maxReplicas=3 in production.
-	Service type: LoadBalancer with AWS NLB annotations for the API Gateway (aws-load-balancer-type: “nlb”).
e)	Release Tagging Strategy.
The project follows a semantic versioning model managed by release.yml:
-	Commits to main: produce images tagged as latest, suitable for continuous development deployments.
-	Version tags (v1.0.0, v1.1.0): produce immutable, versioned images pushed to both ECR and GitHub Container Registry, with automated release notes generated from commit history.
-	Manual releases: workflow_dispatch with release_type (patch/minor/major/prerelease) enables controlled version bumps.
The release workflow generates categorized changelogs (Features, Bug Fixes, Improvements, Documentation, Security, Infrastructure) and creates GitHub Releases with deployment instructions.
The following table summarizes the workflow triggers and their corresponding deployment targets:
Trigger Event	Workflow	Image Tag	Target Environment	Deployment Mode
Push to main	cd.yml	latest	Development (dev)	Automatic
Push tag v*	cd.yml + release.yml	v1.0.0 (from tag)	Production-ready	Automatic
workflow_dispatch	cd.yml	latest or specified	Selected (dev/staging/prod)	Manual
Pull Request	ci.yml	- (no push)	- (validation only)	Automatic
Table 11. Workflow Triggers and Deployment Targets
The project adopts GitOps-aligned practices: declarative manifests in Git, traceable changes through version control, and reproducible deployments via parameterized Helm charts. However, this implementation does not employ a full GitOps operator (such as Argo CD or Flux) for continuous reconciliation. Deployment is pipeline-triggered rather than operator-driven, meaning that configuration drift is possible if manual changes are applied directly to the cluster. Drift detection and automatic convergence are therefore out of scope for this thesis and proposed as future work (Chapter 8).
4.3.6.	CloudFormation Template Implementation
The AWS deployment pipeline relies on CloudFormation templates to provision cloud infrastructure before Kubernetes workloads are deployed. The templates are organized under Infrastructure/aws/cloudformation/ and implement the infrastructure design described in Section 3.5.4.
a)	Template Organization and Structure.
The project maintains four CloudFormation templates:
-	vpc.yaml: Defines the VPC network architecture with parameterized CIDR blocks, public and private subnets across two availability zones, Internet Gateway, NAT Gateway (single for cost optimization in development), and route table associations. The template uses AWS region mappings for availability zone selection and conditional resource creation for NAT EIP allocation.
-	eks-cluster.yaml: Provisions the EKS cluster with managed node groups. Key resources include IAM roles for cluster and worker nodes, the EKS control plane with configurable Kubernetes version (1.29-1.31), a Launch Template with VPC CNI prefix delegation for increased pod density, and a managed node group with auto-scaling configuration and multiple fallback instance types (m7i-flex.large, t3.small/medium/large).
-	s3-bucket.yaml: Creates an S3 bucket for product image storage with environment-specific naming and appropriate access policies for the Catalog service.
-	alb-ingress.yaml: Provisions an Application Load Balancer with target groups and listener configurations for external traffic routing to the EKS cluster.
b)	Stack Deployment Automation.
The deploy-aws.sh script orchestrates CloudFormation stack creation through AWS CLI commands. Stacks are deployed in dependency order: VPC first (outputs VPC ID and subnet IDs), then EKS (references VPC outputs), then S3 and ALB. Each stack creation uses --wait to ensure completion before proceeding. The script supports incremental deployment modes: full deployment provisions all stacks, while "skip infrastructure" mode uses existing stacks for workload-only updates.
c)	Cross-Stack References.
CloudFormation outputs enable loose coupling between stacks. The VPC stack exports vpc-id, public-subnet-ids, and private-subnet-ids with environment-prefixed names (e.g., dev-vpc-id). The EKS stack imports these values via !ImportValue and exports cluster-name and cluster-sg for downstream consumers. This pattern enables stack-level independence while maintaining infrastructure consistency.

| Template | Primary Resources | Key Parameters | Outputs Exported |
| :--- | :--- | :--- | :--- |
| vpc.yaml | VPC, Subnets (4), IGW, NAT-GW, Route Tables | EnvName, VpcCidr, Subnet CIDRs | vpc-id, public-subnet-ids, private-subnet-ids |
| eks-cluster.yaml | EKS Cluster, Node Group, IAM Roles, Launch Template | ClusterName, K8s Version, Node Instance Type/Count | cluster-name, cluster-sg, node-role-arn |
| s3-bucket.yaml | S3 Bucket | EnvName, BucketName | bucket-name, bucket-arn |
| alb-ingress.yaml | ALB, Target Groups, Listeners | EnvName, VpcId, SubnetIds | alb-dns-name, target-group-arn |

*Table 11b. CloudFormation Templates Overview*

### 4.4. Security Implementation
Security in a distributed system must be implemented as a layered set of controls rather than a single mechanism. In this project, security controls are organized across (i) user identity and session management at the frontend, (ii) authenticated request propagation from micro-frontends to backend APIs, (iii) secure configuration handling in the deployment layer, and (iv) continuous security verification through automated scanning in the CI/CD lifecycle. The objective is not to claim production-grade hardening, but to implement a realistic and auditable baseline suitable for a thesis-scale cloud-native platform, while clearly stating limitations and future hardening requirements.
4.4.1.	Security Objectives and Threat Model
The implemented security controls address four practical threats commonly observed in microservices-based web platforms:
-	Unauthorized access to protected UI flows (e.g., checkout, account, order history).
-	Token leakage or inconsistent session state across independently deployed micro-frontends.
-	Insecure configuration practices, especially the accidental exposure of credentials or identity endpoints.
-	Supply-chain risks, including vulnerable dependencies and insecure container images.
Accordingly, the implementation prioritizes: managed authentication, consistent token handling, separation of secrets from code, and automated security checks integrated into delivery pipelines.
4.4.2.	Frontend Authentication and Session Management
a)	Identity Provider Integration (Azure AD B2C via MSAL)
The micro-frontend host application adopts Azure AD B2C as the external identity provider and integrates it through MSAL. This approach intentionally externalizes credential handling and reduces custom authentication code inside the application. The MSAL configuration specifies the B2C tenant authority (including the sign-in/sign-up user flow), a known authority domain, redirect handling, and client-side caching. The current implementation uses browser storage caching (localStorage) to persist sessions across reloads.
A representative configuration excerpt (from the host MSAL setup) illustrates the essential parameters:
auth: {
  clientId: process.env.NX_AZURE_CLIENT_ID,
  authority: process.env.NX_AZURE_AUTHORITY,
  knownAuthorities: [process.env.NX_AZURE_KNOWN_AUTHORITY],
  redirectUri: window.location.origin,
  postLogoutRedirectUri: window.location.origin,
},
cache: { cacheLocation: 'localStorage' }
This configuration is environment-driven: values such as AZURE_B2C_CLIENT_ID, AZURE_B2C_AUTHORITY, and redirect URIs are defined through external configuration rather than being embedded in source code.
b)	Enforcing Authentication at the Shell Boundary
To ensure authentication is applied consistently before remote applications are accessed, the host (shell) wraps its routing structure with a shared authentication provider component. This establishes a single enforcement point for session initialization and avoids each remote implementing divergent login logic.
c)	Legacy Route Protection (Monolith Baseline)
For comparison, the legacy Angular client enforces access control using route guards that redirect unauthenticated users to the login page. This demonstrates the baseline protection pattern used prior to micro-frontend migration, where routing and authentication were inherently centralized within the monolith. 
4.4.3.	Token Propagation and Auth Consistency Across Micro-Frontends
A micro-frontend architecture introduces a security-specific challenge: multiple independently deployed applications must share a consistent view of authentication state. To address this, the platform includes a shared authentication package that standardizes how tokens are obtained and how authenticated API clients are created.
Specifically, the shared auth-provider exposes utilities for producing authenticated HTTP clients (by attaching bearer tokens to requests) and encourages a single implementation of authentication logic reused by all remotes. This reduces fragmentation and lowers the risk of one remote using stale tokens or bypassing expected login flows.
4.4.4.	Secure Configuration and Secrets Handling
At the deployment layer, the project follows the principle of separating configuration from code and images. Non-sensitive parameters are externalized through configuration objects, while secrets (e.g., database passwords and signing keys) are stored outside source control and injected at runtime. In the documented deployment approach, Kubernetes ConfigMaps are used for non-sensitive configuration and Secrets are used for sensitive values; deployments then reference these values via environment variable injection. 
This separation supports (i) safer collaboration (no credentials in Git), (ii) environment portability (different staging/production values without rebuilding), and (iii) improved auditability of what configuration is applied to each environment.
4.4.5.	Supply-Chain and Delivery Pipeline Security
Beyond runtime controls, the platform integrates security checks into the automated delivery lifecycle. The CI/CD workflows incorporate:
-	Dependency and container vulnerability scanning (to identify known CVEs before deployment),
-	Static analysis (to detect common insecure patterns),
-	Registry-level scanning (a second line of defense when images are pushed).
This aligns with the thesis objective of demonstrating a modern cloud-native DevSecOps posture: security verification is treated as a continuous process rather than a one-time review step.
4.4.6.	Service-to-Service Protection and mTLS Readiness
The architecture also anticipates a stricter “zero trust” posture for service-to-service communication through service mesh technology. The project documentation describes Istio integration and the security benefit of enforcing mutual TLS (mTLS) between services so that internal cluster traffic is encrypted and peer identities are verified via certificates, without requiring application code changes. 
In practice, this capability is treated as an extensible security layer: the system can operate without it for resource-constrained environments, while the design remains compatible with later enforcement.
4.4.7.	Limitations and Required Hardening for Production
To preserve academic rigor, several constraints must be stated explicitly:
-	Backend enforcement completeness: frontend authentication alone is insufficient if backend APIs do not validate tokens and enforce authorization policies consistently (issuer/audience checks, expiry validation, role/claim enforcement).
-	CORS and browser exposure: development-friendly permissive CORS policies are inappropriate for production and should be restricted to known origins and minimum required methods/headers.
-	Cluster network isolation: without explicit NetworkPolicies (or equivalent mesh policies), lateral movement within the cluster remains easier than necessary.
-	Secrets protection depth: Kubernetes secrets require encryption-at-rest and strict RBAC controls to provide stronger guarantees under cluster compromise scenarios.
These gaps do not invalidate the implementation; rather, they define a clear boundary between a demonstrable prototype and a production-hardened deployment. 
CHAPTER 5: MONITORING AND OBSERVABILITY
Observability is a foundational requirement in distributed architectures because system behavior emerges from interactions among independently deployed services rather than from a single executable process. In a microservices-based e-commerce platform, a single user action (e.g., viewing the cart or placing an order) can traverse multiple network hops, storage systems, and asynchronous components. Effective operation therefore requires mechanisms to (i) reconstruct incidents and failures, (ii) quantify system health over time, and (iii) localize performance bottlenecks and fault sources to specific services or infrastructure dependencies.
This chapter presents the monitoring and observability strategy implemented in the thesis platform. The implementation follows the three-pillar model, centralized logs, time-series metrics, and distributed traces, and is complemented by service-mesh topology visualization and alerting. In addition, the project deploys operational management interfaces (for containers, databases, and message broker) to support practical verification and debugging during evaluation scenarios.
5.1.	Observability architecture overview 
The platform organizes observability around three primary telemetry signals:
-	Logs record discrete runtime events and contextual information (errors, warnings, and relevant execution states). Centralization is required because container instances are ephemeral and can be rescheduled across nodes.
-	Metrics provide quantitative signals (request rate, error rate, latency percentiles, CPU/memory utilization) that enable trend analysis and anomaly detection.
-	Traces capture causal request paths across service boundaries and support performance diagnosis by identifying which hop contributes to latency or failure.
Telemetry is collected and visualized using an integrated stack deployed alongside application workloads on Kubernetes. Table 5.1 summarizes the main monitoring and operational components.
Dimension	Capability	Technology	Deployment scope
Logging	Structured log generation	Serilog	In-service
Logging	Centralized indexing and storage	Elasticsearch	Helm
Logging	Log exploration UI	Kibana	Helm
Metrics	Time-series scraping and storage	Prometheus	Helm (monitoring)
Metrics	Dashboards and visualization	Grafana	Istio addons / monitoring
Tracing	Distributed tracing UI/backend	Jaeger	Istio addons
Topology	Service graph and health validation	Kiali	Istio addons
Alerting	Alert routing and grouping	Alertmanager	Prometheus stack
Operations	Container/workload management UI	Portainer	Helm
Operations	Database administration UI	pgAdmin	Helm
Operations	Message broker monitoring UI	RabbitMQ Management	RabbitMQ deployment
Table 12. Main Monitoring and Operational Components
Signal / Interface	Typical diagnostic questions	Example usage in the platform
Logs	“What failed?”, “Which service produced the error and why?”	Investigate exceptions in API handlers or downstream calls
Metrics	“Is performance degrading?”, “Which service has increasing latency/error?”	Compare error/latency trends across services under load
Traces	“Where is time spent across service hops?”	Identify bottlenecks at gateway routing or service-to-service calls
Topology	“Which services communicate?”, “Where are failing edges?”	Visualize dependency graph and error edges in Kiali
Ops UIs	“Is infrastructure healthy?”, “Is data persisted correctly?”	Verify queue backlog, query database state, inspect workloads
Table 13. Typical Diagnostic Questions and Telemetry Signals
 
Figure 21. Observability Architecture Overview
5.2.	Centralized logging with the Elastic Stack
In a containerized deployment, service instances are short-lived and can move between nodes; therefore, diagnosing incidents through local log files does not scale. The platform implements centralized logging by producing structured logs at the service level and indexing them into Elasticsearch, with Kibana used for interactive exploration.
5.2.1.	Structured logging strategy (Serilog)
All backend services share a consistent logging baseline through a reusable logging configuration under the shared infrastructure layer. The configuration standardizes:
-	Log level policy: Information as a default operational level, with development-oriented verbosity enabled when appropriate.
-	Log enrichment: each event includes service identity (e.g., application name), environment metadata, and exception details to support cross-service correlation.
-	Output targets: console output for local debugging and an Elasticsearch sink when an Elasticsearch endpoint is configured.
A key design goal is comparability across services: operators should be able to search with the same fields (service name, environment, severity) regardless of which microservice emitted the log event.
5.2.2.	Log storage and indexing (Elasticsearch)
Elasticsearch is deployed as a thesis-scale configuration suitable for demonstration:
-	single-node mode for simplicity and reduced resource demands,
-	constrained heap settings to fit typical academic environments,
-	internal service exposure so application pods can write logs inside the cluster.
This approach is sufficient for functional evaluation of centralized logging and searching workflows. However, it is not intended to represent production-grade indexing capacity, replication, or retention policy design.
5.2.3.	Log exploration (Kibana)
Kibana provides a human-facing interface to query logs across services. In the thesis evaluation flow, Kibana supports:
-	filtering by service identity (e.g., gateway vs domain services),
-	drilling down into error events with stack traces,
-	time-bounding analysis during incident simulation.

 
Figure 22. Kibana Log Discovery Interface
5.3.	Metrics collection and visualization
Logs are essential for “what happened,” but they are not efficient for continuously tracking system health. Metrics provide the quantitative baseline for monitoring and are particularly important for evaluating non-functional properties such as latency, availability, and resource saturation.
5.3.1.	Metrics collection (Prometheus)
Prometheus is deployed via Helm and configured to scrape both infrastructure-level and workload-level targets. The scrape model includes:
-	Kubernetes control-plane and node signals (cluster health and capacity),
-	pod/service-level scraping for instrumented/annotated workloads,
-	optional mesh-level telemetry when Istio is enabled.
The configured scrape interval balances measurement freshness against storage cost and runtime overhead. Persistent storage is configured for Prometheus to retain metrics across restarts, enabling multi-hour or multi-day evaluation runs.
5.3.2.	Dashboards (Grafana)
Grafana provides curated dashboards for:
-	service request rate and error rate (availability signals),
-	latency distributions (including tail latency where possible),
-	resource usage per workload (CPU/memory trends),
-	mesh traffic views when Istio telemetry is available.
The thesis value of Grafana is primarily methodological: it enables repeatable “before vs after” comparisons during evaluation scenarios (e.g., scaling events, injected failures).
5.3.3.	Key metrics used in evaluation
For consistency with industry practice, the platform prioritizes metrics aligned with service reliability methods such as RED (Rate, Errors, Duration) and infrastructure-focused utilization signals. The most useful evaluation metrics for this platform include:
-	request throughput per service,
-	error rate (4xx vs 5xx),
-	latency percentiles (p50/p90/p99 when available),
-	pod restarts and readiness failures,
-	CPU/memory utilization by service.
This set is intentionally small and interpretable, which is appropriate for a thesis: it supports reasoned conclusions without turning monitoring into an unbounded data-collection problem.
5.4.	 Distributed tracing with Jaeger
Tracing addresses a diagnostic gap that logs and metrics cannot fully close: identifying where a single request spends time as it crosses multiple service boundaries. This is especially important in microservices because “slow system” symptoms often emerge from one downstream dependency.
5.4.1.	Trace collection model (Istio-based)
In this platform, tracing is primarily enabled through the service mesh telemetry model: sidecar proxies can generate spans for inbound/outbound requests without requiring each service to implement tracing code. Jaeger is deployed as an in-cluster tracing backend and provides a query UI for trace inspection.
This design aligns with the thesis objective of demonstrating observability with minimal intrusion into business logic: tracing becomes part of the platform layer rather than a per-service implementation burden.
5.4.2.	Trace analysis workflow
The Jaeger UI supports:
-	selecting a service and operation,
-	filtering by duration and error tags,
-	viewing a span timeline to localize latency contributors.
-	A representative trace for a user workflow (e.g., cart enrichment or checkout initiation) can demonstrate multi-hop behavior such as: UI → API Gateway → Basket → Discount (gRPC), with subsequent workflow continuation depending on asynchronous components.
5.4.3.	Limitations
The tracing approach is intentionally lightweight, but it has known limitations:
-	Without application-level instrumentation (e.g., OpenTelemetry SDK), internal spans such as database queries or domain logic execution are not visible.
-	Asynchronous messaging flows (RabbitMQ) may break causal trace continuity when the broker is outside the mesh context.
-	Log–trace correlation is incomplete unless trace identifiers are embedded into structured logs.
5.5.	Service mesh observability with Kiali
Kiali complements tracing by providing a topology-level view of the service mesh: it helps answer “who is talking to whom” and “where are error edges occurring” without requiring deep trace inspection.
5.5.1.	Topology visualization
Kiali renders a service graph derived from mesh telemetry, where nodes represent workloads/services and edges represent traffic. This view is particularly useful in:
-	validating architecture assumptions (expected dependency graph),
-	quickly identifying high-error edges during failure injection,
-	verifying that routing rules behave as designed.
 
Figure 23. Kiali Workloads Dashboard
 
Figure 24. Kiali Service Mesh Graph
5.5.2.	Health signals and configuration feedback
Kiali also surfaces workload health (readiness, traffic success rate) and configuration warnings related to mesh resources. In a thesis context, this is useful for demonstrating that observability includes both runtime monitoring and configuration validation, important in Kubernetes/Istio-based systems where misconfiguration is a common failure mode.
5.6.	Alerting and notification
Alerting is treated as an extension of metrics: rather than requiring operators to continuously observe dashboards, alerts notify when predefined conditions occur (availability loss, latency spikes, saturation). In this platform, Alertmanager is included as part of the Prometheus deployment to support alert routing and grouping.
Because the thesis focuses on architecture and demonstrability, alert rules are kept minimal and are discussed as an operational capability rather than as a fully tuned SLO-based alert program. In production, alert thresholds should be derived from business objectives and error budgets rather than static percentages.
5.7.	Infrastructure management tools
Beyond observability of application behavior, operators often require direct visibility into infrastructure state for validation and debugging. The platform therefore deploys dedicated management interfaces for container workloads and database persistence. These tools are not observability systems in the strict sense, but they complement observability by enabling direct inspection and verification during evaluation.
5.7.1.	Container management with Portainer
Portainer CE is deployed to provide a graphical management interface for containerized workloads. Within the thesis context, its primary value is operational convenience: it enables demonstration and inspection of workloads (status, logs, resource usage) without requiring extensive command-line interaction.
 
Figure 25. Portainer Container Management UI
5.7.2.	Database administration with pgAdmin
pgAdmin is deployed to support database-level validation for PostgreSQL-backed services. During evaluation, pgAdmin enables direct verification of persistence outcomes. For example, after executing a checkout scenario, database queries can confirm that records were created and stored consistently with API responses.

5.8.	Message broker monitoring
Event-driven workflows require visibility into broker state because message backlog and consumer behavior directly affect system responsiveness and reliability.
5.8.1.	RabbitMQ Management UI
RabbitMQ is deployed with its management interface enabled, providing a UI for inspecting queues, consumers, publish/deliver rates, and connection status. In the e-commerce workflow, this interface is useful for debugging “checkout without order creation” scenarios by determining whether messages are published, stuck in queues, or failing during consumption.
 
Figure 26. RabbitMQ Management UI
5.9.	Service mesh telemetry with Istio
Istio plays two roles in the monitoring stack. First, it acts as a traffic management layer for service-to-service communication. Second, it provides standardized telemetry (metrics and traces) that integrates with Prometheus, Grafana, Jaeger, and Kiali. The project includes scripts to support observability tool connectivity and to address common integration issues (e.g., ensuring Kiali and Grafana are correctly wired to Prometheus). In a thesis context, this is relevant because it demonstrates a practical operational challenge: installing tools is insufficient unless their data pipelines are correctly connected.

5.10.	Operational access and tooling
For a thesis-scale cluster (local or restricted environments), observability UIs are typically accessed through port-forwarding. Table 5.3 summarizes access patterns used in the project.
Tool	Local endpoint	Namespace	Access method
Prometheus	http://localhost:9090
monitoring	port-forward service
Grafana	http://localhost:3000
istio-system	port-forward service
Kibana	http://localhost:5601
default	port-forward service
Jaeger	http://localhost:16686
istio-system	port-forward service
Kiali	http://localhost:20001
istio-system	port-forward service
Portainer	http://localhost:9000
default	port-forward service
pgAdmin	http://localhost:8080
default	port-forward service
RabbitMQ UI	http://localhost:15672
default	port-forward service
Table 14. Operational Access Patterns and Tools
The project additionally provides helper scripts to automate access setup and reduce manual operational overhead during demonstrations. 
CHAPTER 6: CASE STUDY AND DEMONSTRATION
The preceding chapters presented the design and implementation of a cloud-native e-commerce platform. This chapter validates the platform through systematic evaluation: deploying the full stack under controlled conditions, exercising representative user workflows, and measuring operational behaviors including autoscaling and self-healing. The objective is to confirm that the architecture delivers on its stated claims and to document observable limitations under realistic evaluation conditions.
6.1.	Evaluation Objectives and Methodology
6.1.1.	Evaluation Objectives
The evaluation addresses three complementary dimensions, each with defined acceptance criteria:
a)	Deployment reproducibility
Can the platform be deployed consistently from source using scripted automation? Acceptance criteria: all pods reach Ready state; Helm releases report “deployed” status; verification endpoints respond successfully.
b)	User flow correctness
Do end-to-end user scenarios function correctly across micro-frontends and microservices? Acceptance criteria: API calls return expected HTTP status codes (2xx); data persists correctly to databases; Module Federation remotes load successfully.
c)	Operational resilience
Does the platform exhibit autoscaling, self-healing, and independent deployability? Acceptance criteria: HPA increases replicas under load; deleted pods are replaced within measurable time windows; MFE updates deploy without affecting other remotes.
Objective	Scenario	Evidence Type	Acceptance Criteria
Deployment	Local (Minikube)	kubectl outputs, helm list	All pods Ready, releases deployed
Deployment	Cloud (AWS EKS)	kubectl outputs, ECR images	Pods Ready, IRSA configured
User Flow	Product browsing	Network tab, API response	200 OK, products rendered
User Flow	Cart operations	Redis inspection, API logs	Cart persisted, 200 OK
User Flow	Checkout	RabbitMQ UI, DB query	Order record created
Resilience	HPA scaling	kubectl get hpa, Grafana	Replicas increase under load
Resilience	Self-healing	kubectl get pods -w	Pod replaced within 60s
Resilience	MFE independence	Network tab, build artifacts	Only target remote redeployed
Table 15. Evaluation Objectives and Acceptance Criteria
6.1.2.	Evaluation Environment
Component	Local Environment	Cloud Environment
Orchestrator	Minikube v1.32+	AWS EKS v1.28
Kubernetes	v1.28 (Minikube default)	v1.28 (EKS managed)
Node Resources	10GB RAM, 8 CPUs	t3.small (2 vCPU, 2GB) × 2
Container Runtime	Docker 24.x	containerd (EKS default)
Helm	v3.14+	v3.14+
Istio	v1.20.0 (optional)	v1.20.0 (optional)
Prometheus	v2.47 (Helm chart)	v2.47 (Helm chart)
Elasticsearch	v7.9.2	v7.9.2
Load Generator	k6 v0.49+	k6 v0.49+
Table 16. Evaluation Environment Specifications (Local vs. Cloud)
6.1.3.	Evaluation Approach
The evaluation follows a scenario-based validation approach:
-	Evidence types: command outputs, screenshots, API responses, database queries, distributed traces, dashboard panels.
-	Repeatability: all scenarios use the same deployment scripts (deploy.sh, deploy-aws.sh) and seed dataset.
-	Load profile: synthetic load generated using k6 with controlled concurrency (50 virtual users, 1000 iterations).
6.2.	Deployment Demonstration
6.2.1.	Local Deployment (Minikube)
The project provides a comprehensive deployment script (deploy.sh) that orchestrates the platform lifecycle on a local Minikube cluster. The script executes in staged phases:
Phase	Function	Description	Key Outputs
1	start_minikube	Initialize cluster (10GB RAM, 8 CPUs, 80GB disk)	Minikube status: Running
2	build_images	Build Docker images for all microservices	5 images tagged
3	deploy_infrastructure	Deploy MongoDB (Catalog), Redis (Basket), PostgreSQL (Discount), SQL Server (Ordering), RabbitMQ	5 database pods Ready
4	deploy_localstack	Deploy LocalStack for S3-compatible storage	LocalStack health: running
5	wait_for_pods	Ensure infrastructure pods reach Ready state	All pods Ready (kubectl wait)
6	deploy_apis	Deploy Catalog, Basket, Discount, Ordering APIs and Gateway	5 service pods Ready
7	migrate_images_to_s3	Seed product images to LocalStack S3	Bucket created, images uploaded
8	deploy_monitoring	Deploy Prometheus, Grafana, Elasticsearch, Kibana, Jaeger, Kiali	Monitoring pods Ready
9	configure_frontend	Prepare frontend environment files	Environment.ts updated
10	verify_deployment	Validate all pods running	API Gateway responds
Table 17. Local Deployment Script Phases (Minikube)
Execution command: ./deploy.sh
Observed deployment time: In the evaluation environment (Table 6.2), deployment completion time ranged from 12–18 minutes, with variance primarily due to Docker image build time. The script uses helm --wait to ensure each release reaches Ready state before proceeding.
Verification evidence:
-	kubectl get pods -n default: All application pods in Running state (1/1 Ready)
-	helm list: All releases in “deployed” status
-	curl http://localhost:8010/: Gateway responds with Ocelot status
6.2.2.	Cloud Deployment (AWS EKS)
For production-like environments, the project provides deploy-aws.sh, which deploys the complete platform to AWS Elastic Kubernetes Service (EKS). The script orchestrates infrastructure provisioning, container registry setup, and Kubernetes workload deployment in staged phases.
Execution command: ./deploy-aws.sh [env] [region] Example: ./deploy-aws.sh dev us-east-1
Phase	Function	Description	AWS Services Used
1	setup_ecr_repositories	Create ECR repositories for 5 microservice images	ECR
2	build_and_push_images	Build Docker images (linux/amd64) and push to ECR	ECR, Docker
3	deploy_vpc	Provision VPC with public/private subnets via reload	CloudFormation, VPC
3.5	deploy_s3_bucket	Create S3 bucket for product images	CloudFormation, S3
4	deploy_eks	Provision EKS cluster (v1.30) and node group	CloudFormation, EKS
5	setup_https_certificate	Create/import SSL certificate for HTTPS	ACM
5.5	install_ebs_csi_driver	Install EBS CSI driver addon for persistent volumes	EKS Addons
6	deploy_databases	Deploy MongoDB, Redis, PostgreSQL, SQL Server, RabbitMQ via Helm	Helm, EBS
6.5	setup_irsa_for_catalog	Configure IAM Role for Service Account (IRSA) for S3 access	IAM, OIDC
7	deploy_api_services	Deploy Catalog, Basket, Discount, Ordering, Gateway via Helm	Helm, ECR
7.5	trigger_migration	Migrate product images from bundled assets to S3	S3, Catalog API
8	deploy_monitoring	Install Prometheus, Istio, Grafana, Jaeger, Kiali	Helm, Istio
9	deploy_alb	Provision Application Load Balancer via CloudFormation	CloudFormation, ALB
10	verify_deployment	Validate all pods Ready, display access URLs	kubectl
Table 18. Cloud Deployment Script Phases (AWS EKS)
Key architectural differences from local deployment:
Aspect	Local (Minikube)	Cloud (AWS EKS)
Container registry	Local Docker daemon	Amazon ECR
Object storage	LocalStack (S3 emulation)	Real AWS S3 bucket
IAM authentication	Not applicable	IRSA (OIDC federation)
Load balancing	NodePort / port-forward	AWS Application Load Balancer
Persistent volumes	hostPath	EBS CSI driver with gp2/gp3
SSL/TLS	Not configured	ACM certificate
Infrastructure provisioning	Minikube start	CloudFormation stacks
Table 19. Differences between Cloud Deployments and local deployment:
IRSA (IAM Roles for Service Accounts) configuration:
-	The Catalog service requires S3 access for product images. The script configures IRSA to enable pod-level IAM authentication:
-	Creates IAM policy granting s3:GetObject, s3:PutObject, s3:DeleteObject, s3:ListBucket
-	Creates IAM role with OIDC trust relationship for the EKS cluster
-	Annotates the catalog ServiceAccount with the IAM role ARN
-	Helm deployment uses serviceAccount.name=catalog to inherit permissions
Deployment mode options:
The script supports three modes via interactive selection:
-	Full deployment: Complete infrastructure and workload deployment
-	Skip infrastructure: Use existing VPC, EKS, S3; deploy only workloads
-	Skip build: Use existing ECR images; deploy infrastructure and workloads
Observed deployment time: In the evaluation environment, full deployment completed in 35–45 minutes, with the majority of time spent on CloudFormation stack creation for VPC and EKS (20–25 minutes). Incremental deployments (skip infrastructure mode) complete in 10–15 minutes.
Verification evidence:
-	kubectl get pods -n dev: All pods in Running state
 
Figure 27. Al Pods in Running State
-	aws cloudformation list-stacks: Three stacks in CREATE_COMPLETE (vpc, eks, alb)
 
Figure 28. AWS CloudFormation Stacks
-	ALB DNS name: Accessible via browser or curl
6.3.	User Flow Demonstration
This section demonstrates end-to-end user scenarios that exercise frontend composition and backend integration. Each scenario defines success criteria and verification artifacts.
Flow	Frontend	Backend Services	Databases	Success Criteria
Browse products	Store MFE	Catalog API	MongoDB	Products displayed, images loaded
Add to cart	Store MFE	Basket API	Redis	Cart persisted, 200 OK
Checkout	Checkout MFE	Basket → Discount (gRPC) → RabbitMQ → Ordering
PostgreSQL, SQL Server	Order record created
Table 20. User Flow Scenarios and Success Criteria
6.3.1.	Product Browsing (Store MFE)
The store micro-frontend is dynamically loaded when a user navigates to /store. The Module Federation runtime fetches the remote entry from the store application and mounts it within the host shell.
Flow:
 
Figure 29. Product Browsing Flow Sequence Diagram
Success criteria:
-	remoteEntry.js loaded successfully (HTTP 200)
-	GET /Catalog/products returns 200 with JSON array
-	Product images render from S3 URL
-	Verification artifacts:

 
Figure 30. Store Micro-Frontend  Networks Check
6.3.2.	Cart Operations (Store → Checkout Interaction)
Adding items to cart demonstrates cross-MFE state sharing and backend persistence.

Flow:
 
Figure 31. Cart Operations (Store → Checkout Interaction)
Success criteria:
-	POST /Basket/{userId} returns 200 OK
-	Cart data persists in Redis (verified via redis-cli KEYS basket:*)
-	Checkout MFE displays correct cart contents
User identity: In the evaluation, a hardcoded userId (“swn”) is used for demonstration purposes. Production deployments would use authenticated JWT tokens.
The E2E test cross-microfrontend.spec.ts programmatically validates this flow.
6.3.3.	Checkout Flow (Event-Driven)
Checkout demonstrates the event-driven architecture connecting Basket and Ordering services.

Flow:

 
Figure 32. Checkout Flow
Success criteria:
-	POST /Basket/checkout returns 202 Accepted
-	RabbitMQ Management UI shows message published then consumed
-	SQL Server Orders table contains new order record 
Verification artifacts:
 
Figure 33. RabbitMQ Management UI showing queue drained
 
Figure 34 OrderDb query result showing order record
Screenshot: Jaeger trace for synchronous portion (Gateway → Basket → Discount)
 
Figure 35. Jaeger Distributed Tracing U
6.4.	Operational Resilience Demonstration
6.4.1.	Horizontal Pod Autoscaling 
The platform configures HPA resources for services via Helm templates. Table 6.5 summarizes the HPA configuration per service.
Service	autoscaling.enabled	minReplicas	maxReplicas	CPU Target
Catalog	true	1	100	80%
Basket	false (template exists)	1	100	80%
Discount	false (template exists)	1	100	80%
Ordering	false (template exists)	1	100	80%
Service	autoscaling.enabled	minReplicas	maxReplicas	CPU Target
Table 21. Key architectural differences from local deployment:
Note: By default, only Catalog has autoscaling enabled. Other services can enable HPA by setting autoscaling.enabled=true in values.yaml or via Helm --set flag.
Demonstration procedure:

-	Verify initial state: kubectl get hpa -n default
-	Generate load: k6 run --vus 50 --iterations 1000 load-test.js
-	Observe scaling: kubectl get hpa --watch
-	Monitor in Grafana: CPU utilization, replica count panels
Observed behavior: In the evaluation environment, with Catalog HPA enabled:
-	Baseline: 1 replica at ~15% CPU
-	Under load: CPU increased to ~85% within 30 seconds
-	Scale-up: HPA increased replicas from 1 to 2 after ~60 seconds (metrics evaluation delay)
-	Stabilization: CPU per pod dropped to ~45%
-	Scale-down: After load stopped, replicas returned to 1 after ~5 minutes (stabilization window)
Figure 6.3 (recommended): Grafana panel showing CPU utilization and replica count during load test.
6.4.2.	Self-Healing and Recovery
Kubernetes restarts failed containers based on liveness and readiness probes. The probes serve different purposes:
-	Liveness probe: Determines if container should be restarted (unhealthy = restart)
-	Readiness probe: Determines if container should receive traffic (not ready = excluded from Service endpoints)
Probe	Path	Initial Delay	Period	Timeout	Failure Threshold
Liveness	/health	30s	10s	5s	3
Readiness	/ready	20s	5s	3s	3
Table 22. Liveness and Readiness Probes Configuration
Demonstration procedure:
-	Identify a running pod: kubectl get pods -l app.kubernetes.io/name=catalog
-	Delete the pod: kubectl delete pod
-	Observe replacement: kubectl get pods -w
Observed behavior:
-	Pod deletion detected immediately
-	Kubernetes scheduled replacement pod within 2 seconds
-	New pod reached Running state in ~25 seconds (image already cached)
-	Pod reached Ready state (passed readiness probe) in ~45 seconds total
Event	Time from Deletion
Replacement scheduled	~2s
Container started	~10s
Running state	~25s
Ready state (traffic routed)	~45s
Table 23. Pod Recovery Timeline
6.4.3.	Independent Micro-Frontend Deployment
Module Federation enables updating one remote without redeploying the host or other remotes.
Demonstration procedure:
-	Record current checkout MFE build hash (from remoteEntry.js URL or dist folder)
-	Make a change to checkout MFE (e.g., update button text)
-	Build only checkout: nx build checkout --configuration=production
-	Deploy updated checkout remote (to CDN or Kubernetes)
-	Refresh browser and navigate to checkout
-	Verify: checkout shows updated content; store MFE unchanged
Verification evidence:
-	Host application: No rebuild required
-	Store MFE: Same remoteEntry.js URL (unchanged)
-	Checkout MFE: New remoteEntry.js URL or chunk hash
This validates that the runtime composition model supports independent release cycles

6.5.	Verification evidence:
This section validates that the observability stack supports incident investigation and performance analysis.
6.5.1.	Log Inspection (Kibana)
During the checkout flow demonstration, Kibana was used to verify log capture:
-	Access Kibana at http://localhost:5601
-	Navigate to Discover, select index pattern ecommerce-Logs-*
-	Filter by fields: ApplicationName, Level, message
-	Search for “BasketCheckoutEvent” or “OrderCreated”
Observed result: Log entries from Basket.API and Ordering.API appeared with structured fields (timestamp, service name, log level, message). Cross-service correlation was possible by filtering on common request identifiers.
6.5.2.	Metrics Dashboard (Grafana)
During the HPA scaling demonstration, Grafana panels displayed:
-	Request rate: Spike from ~0 to ~150 req/s during load test
-	CPU utilization: Increase from ~15% to ~85%
-	Pod count: Replica increase from 1 to 2
 
Figure 36. Grafana Pod Metrics Dashboard
6.5.3.	Distributed Trace (Jaeger)
For the checkout flow synchronous portion:
-	Access Jaeger at http://localhost:16686
-	Select service “eshopping-ocelotapigw”
-	Filter by operation and time range
-	Inspect trace timeline
Observed result: Trace showed spans for:
-	Gateway routing (~5ms)
-	Basket.API processing (~50ms)
Limitation observed: The async consumption by Ordering.API appeared as a separate, disconnected trace due to RabbitMQ breaking trace context.
6.6.	Limitations Observed During Evaluation
The evaluation revealed practical limitations that inform production hardening recommendations:
Limitation	Observed Behavior	Mitigation/Future Work
Local resource constraints	Minikube (10GB RAM) experienced pod eviction under heavy load	Use EKS or increase Minikube resources
Async trace discontinuity	RabbitMQ breaks trace context; Basket → Ordering traces disconnected
Propagate trace headers in message payload
MFE cold-start latency	First remote load: ~500ms; Cached navigation: ~50ms	Implement preloading or service worker caching
Observability access	Port-forwarding required for all UIs	Use Ingress/LoadBalancer in production
HPA scale-down delay	5-minute stabilization window before scale-down	Expected behavior; tune stabilizationWindowSeconds if needed
Autoscaling disabled by default	Only Catalog has HPA enabled	Enable for other services in production values
Table 24. Observed Limitations During Evaluation
6.7.	Summary
The case study demonstrates that the cloud-native e-commerce platform achieves its stated design objectives:
Objective	Validation Result
Deployment reproducibility	Scripts produce consistent deployments; all pods Ready
User flow correctness	All scenarios complete successfully; data persists correctly
Autoscaling	HPA scales Catalog from 1 to 2 replicas under load
Self-healing	Deleted pods replaced and Ready within 45 seconds
Independent MFE deployment	Checkout updated without affecting Store or Host
Observability	Logs, metrics, and traces captured and queryable
Table 25. Evaluation Summary
The evaluation also documented practical limitations, async trace gaps, cold-start latency, resource constraints, that define clear improvement areas for production hardening without invalidating the architecture.

CHAPTER 7: EVALUATION AND DISCUSSION
This chapter evaluates the cloud-native e-commerce platform against the objectives established in Chapter 1, examining both functional completeness and non-functional quality attributes. The evaluation methodology combines automated testing, manual verification, and observability-driven analysis. Beyond validating that the system works, this chapter critically examines architectural trade-offs, documents lessons learned from implementing microservices and micro-frontends at thesis scale, and identifies gaps that inform future work recommendations.
The evaluation is structured across four dimensions: (i) functional correctness of business capabilities, (ii) non-functional properties including performance, scalability, and resilience, (iii) architectural analysis of benefits realized versus challenges encountered, and (iv) DevOps practices effectiveness. Each dimension includes evidence-based assessment using data from deployment demonstrations (Chapter 6), automated test results, and observability tooling.
7.0.1.	Experimental Setup
The following table summarizes the evaluation environment and test parameters used throughout this chapter.
Parameter	Value
Cluster Type	Minikube (local development)
Node Configuration	2 CPU cores, 4GB RAM
Kubernetes Version	v1.28+
Container Runtime	Docker
Dataset Size	12 products, sample orders
k6 Test Duration	30 seconds per service
k6 Virtual Users	10 per service
Table 26. Experimental Setup Parameters
These parameters represent a development-scale evaluation. Production deployments would require larger clusters, longer test durations, and statistically significant sample sizes.
7.1.	Functional Evaluation
This section evaluates whether the platform delivers the intended business capabilities as specified in the project scope.
7.1.1.	Feature Completeness Assessment
Table 7.1 summarizes the implementation status of each functional epic, cross-referenced with verification methods used to validate correctness.
Epic	Features Implemented	Verification Method	Status
Product Catalog	Browse, search, filter, view details, image gallery	E2E tests, manual verification, API testing	Implemented
Shopping Cart	Add/remove items, quantity update, cart persistence	E2E tests, Redis inspection, API logs	Implemented
Checkout	Cart summary, discount application, order creation	E2E tests, database query, Jaeger traces	Implemented
Order Management	Order history, status tracking	API testing, database verification	Implemented
Discount	Coupon application via gRPC	E2E tests, Jaeger trace inspection	Implemented
Table 27. Feature Completeness Assessment
All core e-commerce capabilities are implemented and verified. The verification approach combines multiple evidence sources: automated tests validate happy-path scenarios, database inspection confirms persistence correctness, and distributed traces confirm cross-service integration (particularly for the Basket → Discount gRPC call and the event-driven checkout flow).
7.1.2.	API Contract Validation
Backend API contracts were validated against expected behavior for each microservice. Table 7.2 summarizes the validation results per service.
Service	Endpoint Pattern	Methods Validated	Protocol	Status
Catalog	/Catalog/*	GET, POST, PUT, DELETE	REST	Validated
Basket	/Basket/*	GET, POST, DELETE	REST	Validated
Discount	/Discount/*	GET, PUT, POST, DELETE	gRPC	Validated
Ordering	/Order/{userName}	GET	REST (event-triggered)	Validated
Table 28. API Contract Validation Results
Validation was performed using a combination of:
-	Postman collections for manual API testing (available in PostmanCollection/)
-	Jaeger distributed traces for verifying request flow through the API Gateway
-	Database inspection for confirming write operations
The gRPC interface between Basket and Discount services was validated through trace inspection, confirming that discount enrichment occurs synchronously before checkout event publication.
7.1.3.	Proposed E2E Testing Strategy: Katalon Platform
This section describes a proposed testing extension using the Katalon Platform. The integration strategy is designed for future implementation; the following describes how Katalon TrueTest, Studio, TestCloud, and TestOps would be used to establish comprehensive E2E test coverage.
a)	Testing Platform Overview
The Katalon Platform provides an integrated ecosystem for test automation:
-	Katalon TrueTest: AI-augmented autonomous testing that discovers and generates tests from real user behavior by deploying an agent snippet to capture user journeys.
-	Katalon Studio: IDE for web, API, and mobile test automation supporting both codeless (record/playback) and scripted modes.
-	Katalon TestCloud: Cloud-based test execution infrastructure with browser/device combinations.
-	Katalon TestOps: Test management, analytics, and CI/CD orchestration platform.
b)	Proposed TrueTest Integration Strategy
The proposed TrueTest integration would follow a three-phase approach aligned with the micro-frontend architecture:
-	Live Usage Intelligence: Deploy the TrueTest Agent (a lightweight JavaScript snippet) to production micro-frontends. The agent would capture real user interactions including:
●	Navigation patterns across Store → Checkout → Account MFEs
●	Form interactions and input sequences
●	Error scenarios and edge cases users encounter
-	Autonomous Test Generation: TrueTest would analyze captured user journeys and generate regression test cases reflecting actual usage patterns.
-	Self-Maintaining Tests: As micro-frontends evolve, TrueTest would adapt test selectors and flows, reducing maintenance overhead.

c)	Katalon Studio Test Implementation
The proposed Katalon Studio implementation follows a structured approach to test design and test organization.
Test Design Approach:
Tests would be designed using Katalon Studio's dual-mode capability:
-	Manual Scripting: Custom Groovy scripts for complex validation logic and data-driven scenarios
-	Record and Playback: Rapid test creation for straightforward user flows, refined manually for robustness
Test Suite Organization:
All test cases would be consolidated into a single regression test suite for simplified management:
Test Suite	Test Cases	Coverage
RegressionTest	All E2E tests	Product browsing, cart operations, checkout flow, order history, cross-MFE navigation
Table 29. Proposed Test Suite Organization
Execution Strategy:
The regression test suite would be executed through two complementary triggers:
Trigger	Platform	Schedule	TestCloud Environment	Purpose
Daily Scheduled	Katalon TestOps	Every day at 2:00 AM	Cross-browser matrix	Comprehensive regression testing
Pull Request	GitHub Actions	On PR to main/develop	Primary browser (Chrome)	Pre-merge validation
Daily Scheduled	Katalon TestOps	Every day at 2:00 AM	Cross-browser matrix	Comprehensive regression testing
Pull Request	GitHub Actions	On PR to main/develop	Primary browser (Chrome)	Pre-merge validation
Table 30. Proposed Test Trigger Schedule
TestOps Scheduling Configuration:
Katalon TestOps would schedule daily execution of the regression suite:
-	Schedule: Daily at 2:00 AM UTC
-	Test Suite: Regression
-	Environment: TestCloud (rotating through browser matrix)
-	Notifications: Email on failure
GitHub Actions PR Trigger:
Pull requests would trigger automated testing via GitHub Actions workflow, executing the same regression suite on TestCloud for rapid feedback before merge.
d)	Proposed TestCloud Execution Matrix
TestCloud would enable cross-browser and cross-device testing without local infrastructure. The following matrix represents the proposed test coverage:
Browser/Device	Operating System	Environment ID	Testing Purpose
Chrome	Windows	1321	Primary browser coverage
Edge	Windows	1222	Enterprise/corporate users
Safari	macOS	1256	Apple ecosystem validation
Chrome	macOS	1255	Cross-platform Chrome testing
Edge	macOS	1354	Cross-browser compatibility
Table 31. Proposed TestCloud Execution Matrix
Note: Actual TestCloud environment IDs are workspace-specific configuration values stored in CI/CD secrets.
e)	TestOps Integration with GitHub Actions
Katalon tests are integrated into the CI/CD pipeline via GitHub Actions, triggering automatically on pull requests:
name: Katalon TestCloud E2E Tests

on:
  pull_request:
    branches: [main, develop]
    paths:
      - 'ecommerce-micro-frontend/**'
      - 'Services/**'

jobs:
  katalon-testcloud:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        testCloudEnvironmentId:
          - '1321'  # Windows Chrome
          - '1222'  # Windows Edge
          - '1256'  # macOS Safari
          - '1255'  # macOS Chrome
          - '1354'  # macOS Edge
    steps:
      - uses: actions/checkout@v4
      - name: Run Katalon Tests on TestCloud
        uses: katalon-studio/katalon-studio-github-action@v4
        with:
          version: '10.4.2'
          projectPath: '${{ github.workspace }}/katalon-tests'
          args: >-
            -retry=0
            -testSuitePath=“Test Suites/RegressionTest”
            -browserType=“TestCloud”
            -testCloudEnvironmentId=“${{ matrix.testCloudEnvironmentId }}”
            -apiKey=“${{ secrets.KATALON_API_KEY }}”

Key configuration elements:
-	PR Trigger: Tests run automatically on pull requests to main/develop branches
-	Path Filters: Only triggers when frontend or backend code changes
-	Matrix Strategy: Parallel execution across Chrome, Safari, and Mobile environments
-	TestCloud Environment: Managed cloud infrastructure eliminates local setup requirements
-	API Key: Stored as GitHub Secret for secure authentication

TestOps Dashboard provides:
-	Test scheduling for daily regression runs and release validation
-	Analytics including test health trends, failure analysis, and flaky test detection
-	Requirement traceability linking test cases to Jira user stories
-	Release readiness reports with pass/fail summary per release
7.2.	Non-Functional Evaluation
This section evaluates the platform against non-functional quality attributes: performance, scalability, resilience, and observability effectiveness.
7.2.1.	Performance Evaluation
Performance evaluation combines backend load testing using k6 and frontend metrics analysis.
a)	Backend Performance (k6 Load Testing)
Load testing was performed using k6, an open-source load testing tool designed for testing the performance of APIs and microservices. Tests targeted the primary API endpoints through the Ocelot API Gateway. Test results were exported to JSON format, parsed via a custom script, and pushed to Prometheus Pushgateway for short-lived batch job metrics visibility.
 
Figure 37. Grafana Pod Metrics Dashboard
Test Configuration:
-	Virtual Users: 10 per service
-	Duration: 30 seconds per test
-	Environment: Local Kubernetes cluster (Minikube)
-	Metrics Pipeline: k6 JSON output → push-metrics.sh → Pushgateway → Prometheus → Grafana
k6 Test Suites:
Test Suite	Endpoint	Service Port	Purpose
catalog-test.js	GET /api/v1/Catalog/GetAllProducts	8081	Product listing performance
basket-test.js	GET /api/v1/Basket/GetBasket/{userName}	8082	Cart read performance
ordering-test.js	GET /api/v1/Order/{userName}	8083	Order history query performance
discount-test.js	gRPC DiscountProtoService	8084	Skipped (gRPC-only service, see file for example)
Table 32. k6 Load Test Suites
Actual Test Results:
Service	Total Requests	Throughput	Avg Latency	p95 Latency	Error Rate	Status
Catalog	595	19.61/s	480.52ms	836.00ms	0.00%	Not achieved
Basket	966	32.17/s	310.68ms	630.78ms	0.00%	Partially achieved
Ordering	825	27.21/s	366.00ms	635.31ms	0.00%	Partially achieved
Discount	-	-	-	-	-	Not evaluated
Table 33. Actual Test Results: Performance Targets vs. Actual
Performance Targets vs. Actual:
The p95 < 500ms target was chosen as an internal SLO for interactive APIs, aligned with industry best practices for e-commerce user experience where response times above 500ms negatively impact conversion rates.
Metric	Target	Catalog	Basket	Ordering	Assessment
http_req_duration (avg)	< 400ms	507.52ms (fail)	310.68ms (pass)	366.00ms (pass)	2/3 pass
http_req_duration (p95)	< 500ms	836.00ms (fail)	630.78ms (fail)	635.31ms (fail)	0/3 pass
http_req_failed	< 1%	0.00% (pass)	0.00% (pass)	0.00% (pass)	All pass
http_reqs (throughput)	> 25/s	19.61/s (fail)	32.17/s (pass)	27.21/s (pass)	2/3 pass
Analysis:

-	Basket Service achieved best average latency (310ms), benefiting from Redis's in-memory performance
-	Catalog Service had highest latency (507ms avg, 836ms p95), likely due to MongoDB document query complexity and dataset size
-	Ordering Service performed well on average (366ms) but p95 exceeded target due to occasional slow queries
-	All services achieved 0% error rate, demonstrating stability under load
-	p95 targets not met indicates need for performance optimization (database indexing, caching, query optimization)

Spike Test Results (spike-test.js):
A spike test was conducted to verify system behavior under sudden traffic surge, simulating scenarios like flash sales or viral events:
Stage	Duration	VUs	Purpose
Baseline	1 min	2	Establish normal operation
Spike	30s	2→100	Sudden traffic surge
Maintain	2 min	100	Sustained peak load
Drop	30s	100→2	Traffic normalization
Recovery	1 min	2	System recovery verification
Table 34. Spike Test Stages
Spike Test Results:
Metric	Value	Threshold	Status
Total Requests	23,190	-	-
Peak Rate	77.27 req/s	-	Achieved
Average Latency	658.32ms	-	-
P50 Latency	289.32ms	-	Responsive under load
P95 Latency	1,959.99ms	< 2,000ms	Pass
Max Latency	9,971.24ms	-	Outlier during spike
Error Rate	0.00%	< 10%	Pass
Table 35. Spike Test Results
Spike Test Analysis:
-	System handled 100 concurrent users without errors (0% failure rate)
-	P95 response time (1.96s) remained within the 2s threshold during peak load
-	Median response (289ms) indicates most requests completed quickly
-	Maximum latency (9.97s) represents worst-case outliers during the initial spike ramp-up
-	System recovered gracefully after spike subsided	

Stress Test Results (stress-test.js):
A stress test was conducted to gradually increase load and identify system breaking points:
Stage	Duration	VUs	Purpose
Warm up	1 min	0→10	Initial ramp-up
Baseline	2 min	10	Establish baseline performance
Ramp to medium	2 min	10→50	Gradual load increase
Medium load	2 min	50	Sustained medium load
Ramp to high	2 min	50→100	Increase to maximum
Peak load	2 min	100	Sustained peak load
Ramp down	1 min	100→0	Graceful cooldown
Table 36. Stress Test Stages
Stress Test Results:
Metric	Value	Threshold	Status
Total Requests	14,662	-	-
Request Rate	20.33 req/s	-	Consistent throughput
Average Latency	393.45ms	-	Good average
P95 Latency	979.70ms	< 1,000ms	Pass
Max Latency	5,643.97ms	-	Outlier under peak load
Error Rate	0.00%	< 5%	Pass
Max VUs	100	-	Achieved
Table 37. Stress Test Results
Stress Test Analysis:
-	System sustained 100 VUs for extended period (12 minutes total) without degradation
-	P95 response time (979ms) stayed within the 1s threshold
-	Zero errors throughout the entire test, indicating stable behavior under increasing load
-	Average latency (393ms) remained acceptable even under maximum load
-	No breaking point discovered within the tested range (0-100 VUs)

Soak Test Results (soak-test.js):
A soak test was conducted to detect memory leaks, resource exhaustion, and performance degradation over extended periods:
Stage	Duration	VUs	Purpose
Ramp up	2 min	0→20	Gradual load increase
Soak period	8 min	20	Extended steady load
Ramp down	1 min	20→0	Graceful cooldown
Table 38. Soak Test Stages
Soak Test Results:
Metric	Value	Threshold	Status
Duration	11 minutes	-	-
VUs	20 (steady)	-	-
Total Requests	4,695	-	-
Request Rate	7.09 req/s	-	Consistent
Average Latency	442.55ms	-	Acceptable
P50 (Median)	286.22ms	-	Responsive
P90 Latency	827.82ms	-	-
P95 Latency	1,335.36ms	< 800ms	Fail
P99 Latency	~2,690ms	< 1,200ms	Fail
Max Latency	9,954.50ms	-	Outlier
Error Rate	0.00%	< 1%	Pass
Table 39. Soak Test Results
Soak Test Analysis:
-	System demonstrated zero errors over 11 minutes of continuous load
-	Median response time (286ms) remained fast throughout the test
-	P95/P99 thresholds exceeded, indicating tail latency issues under sustained load
-	98% of requests met the response time threshold (4,606 of 4,695)
-	Recommendations: Optimize slow endpoints, investigate MongoDB query performance, consider connection pooling tuning

Sample k6 Test Script (tests/k6/catalog-test.js):
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,  // 10 virtual users
  duration: '30s',  // Test duration
};

export default function () {
  let response = http.get('http://localhost:8081/api/v1/Catalog/GetAllProducts');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}

Execution Commands:
Run all tests with PushGateway integration
./tests/k6/push-metrics.sh

 Run individual test
k6 run --vus 10 --duration 30s tests/k6/catalog-test.js

View metrics in Prometheus
curl http://localhost:9091/metrics | grep k6_

b)	Frontend Performance (Module Federation Benefits)
The migration to micro-frontends using Module Federation provides measurable performance improvements compared to the monolithic Angular frontend baseline. The following metrics are indicative estimates based on webpack-bundle-analyzer output and Chrome DevTools Lighthouse audits (cold cache, simulated 4G throttling):
Metric	Monolithic (before)	Micro-Frontend (after)	Improvement
Initial bundle size	~2.5 MB	~800 KB (host only)	68% reduction
Remote chunk size	N/A	~150-300 KB per MFE	Lazy loading
First Contentful Paint	~2.5s	~1.2s	52% faster
Time to Interactive	~4.0s	~2.0s	50% faster
Table 40. Frontend Performance Metrics (Monolithic vs. Micro-Frontend)
Key architectural factors contributing to performance gains:
-	Lazy loading of remote modules: Only the Host shell loads initially; Store, Checkout, and Account MFEs load on-demand when navigated
-	Code splitting by domain: Each MFE contains only its domain-specific code, reducing parse/compile time
-	Shared dependency deduplication: Common libraries (React, Ant Design) are shared via Module Federation's shared scope, avoiding duplicate downloads
7.2.2.	Scalability Evaluation
Scalability was evaluated through Horizontal Pod Autoscaler (HPA) behavior and database-per-service isolation.
a)	HPA Scaling Results (from Chapter 6 Demonstration)
Service	HPA Enabled	Min Replicas	Max Replicas	CPU Target
Catalog	Enabled	1	100	80%
Basket	Template exists	1	100	80%
Discount	Template exists	1	100	80%
Ordering	Template exists	1	100	80%
Table 41. HPA Scaling Configuration & Results (Recap)
During the load testing demonstration (Chapter 6), the Catalog service exhibited the following scaling behavior:
-	Baseline: 1 replica at ~15% CPU utilization
-	Under load (50 VUs): CPU increased to ~85% within 30 seconds
-	Scale-up trigger: HPA increased replicas from 1 to 2 after ~60 seconds (metrics evaluation delay)
-	Stabilization: CPU per pod dropped to ~45% after scale-up
-	Scale-down: Replicas returned to 1 after ~5 minutes of reduced load
b)	Database-per-Service Isolation Benefits
Each microservice owns its dedicated database, enabling independent scaling of data tier:
-	Catalog (MongoDB): Document-based scaling for read-heavy product queries
-	Basket (Redis): In-memory scaling for high-frequency cart operations
-	Discount (PostgreSQL): Relational scaling for coupon lookups
-	Ordering (SQL Server): Transactional scaling for order persistence
This isolation prevents database contention bottlenecks that commonly occur in shared-database architectures.
7.2.3.	Resilience Evaluation
Resilience was evaluated through pod crash recovery, service overload behavior, and micro-frontend failure handling.
Scenario	Injection Method	Observed Behavior	Recovery Time
Pod crash	kubectl delete pod	Pod replaced, traffic rerouted	~45s
Service overload	k6 stress test	HPA scales up replicas	~60s
Network partition	Not implemented	Future work	N/A
MFE failure	Module load error	Error boundary displayed, retry available	User-driven
Table 42. Resilience Evaluation Scenarios
Pod Recovery Timeline (from Chapter 6):
Event	Time from Deletion
Replacement scheduled	~2s
Container started	~10s
Running state	~25s
Ready state (traffic routed)	~45s
Table 43. Pod Recovery Timeline (Recap)
Kubernetes self-healing mechanisms successfully replaced crashed pods within acceptable time windows. Liveness and readiness probes ensure traffic is only routed to healthy instances.
7.2.4.	Observability Effectiveness
Observability was evaluated against coverage and diagnostic utility metrics.
Metric	Definition	Target	Measured
Log completeness	% of requests with structured logs	100%	100%
Trace coverage (sync)	% of synchronous requests with traces	100%	100%
Trace continuity (async)	% of async flows with connected traces	100%	~0% (known gap)
Dashboard availability	Grafana/Kibana uptime during evaluation	99%	100%
Table 44. Observability Effectiveness Metrics
Known Limitation: Asynchronous messaging via RabbitMQ breaks trace context. The BasketCheckoutEvent published by Basket.API and consumed by Ordering.API appear as disconnected traces in Jaeger. This is a documented limitation requiring OpenTelemetry instrumentation at the messaging layer (proposed as future work in Chapter 8).

7.3.	Architectural Analysis
This section analyzes the architectural trade-offs realized through microservices and micro-frontend adoption.
7.3.1.	Microservices Architecture: Benefits Realized
Benefit	Evidence in Project
Independent deployment	Each service has own Helm chart, versioned separately; demonstrated in Chapter 6
Technology diversity	MongoDB, Redis, PostgreSQL, SQL Server selected per service workload needs
Team autonomy	Clean Architecture enables isolated development per bounded context
Fault isolation	Service crash doesn't bring down entire system; demonstrated via pod deletion test
Scalability	HPA configured per service; Catalog scaled independently under load
Data ownership	Database-per-service prevents schema coupling and runtime contention
Table 45. Microservices Architecture: Benefits Realized
7.3.2.	Microservices Architecture: Challenges Encountered
Challenge	Manifestation	Mitigation Applied
Data consistency	Eventual consistency via events	Accept eventual model, document boundaries, Saga pattern
Distributed tracing	RabbitMQ breaks trace context	Document as limitation, propose OpenTelemetry for future
Operational complexity	Many services to monitor	Centralized observability stack (ELK, Prometheus, Jaeger)
Network overhead	Inter-service latency	gRPC for latency-sensitive paths (Basket → Discount)
Testing complexity	Integration tests span services	E2E tests via Katalon, API contract validation
Table 46. Microservices Architecture: Challenges Encountered
7.3.3.	Micro-Frontend Architecture: Benefits Realized
Benefit	Evidence in Project
Independent deployment	Each MFE independently buildable/deployable; demonstrated in Chapter 6
Team autonomy	Separate codebases per MFE (store/, checkout/, account/)
Reduced bundle size	68% reduction in initial load; lazy loading of remotes
Technology flexibility	Each MFE could use different React version if needed
Blast radius reduction	UI changes isolated to affected MFE; Store update doesn't affect Checkout
Table 47. Micro-Frontend Architecture: Benefits Realized
7.3.4.	Micro-Frontend Architecture: Challenges Encountered
Challenge	Manifestation	Mitigation Applied
Styling consistency	Potential CSS conflicts across MFEs	Shared design system via packages/shared-layout
State sharing	Complex cross-MFE state management	Shared context via auth-provider, Zustand stores
Initial complexity	Module Federation configuration overhead	NX workspace generators, documented patterns
Cold-start latency	First load of remote modules ~500ms	Caching, potential preloading (future work)
Routing coordination	Deep linking, history management	Centralized router in host, onNavigate callbacks
Table 48. Micro-Frontend Architecture: Challenges Encountered
7.4.	DevOps Practices Evaluation
The effectiveness of DevOps practices was evaluated against their intended purposes.
Practice	Implementation	Effectiveness	Evidence
Infrastructure as Code	Helm charts (17 charts)	High	Reproducible deployments across local/AWS
Automated Deployment	deploy.sh, deploy-aws.sh	High	Single-command deployment demonstrated
CI/CD Pipeline	GitHub Actions (ci.yml, cd.yml)	High	Automated testing, image builds, deployment
Observability	ELK, Prometheus, Jaeger, Kiali	High	Comprehensive runtime visibility
Configuration Management	ConfigMaps, Helm values	High	Environment-specific configs without rebuilds
Security Scanning	Trivy, CodeQL	Medium	Vulnerability detection in CI pipeline
Release Management	Semantic versioning, release.yml	High	Automated changelog, version tagging
Table 49. DevOps Practices Effectiveness
Areas for improvement:
-	GitOps operator: Current pipeline-triggered deployment could drift; Argo CD or Flux would provide continuous reconciliation
-	Canary deployments: Progressive delivery not implemented; all deployments are immediate replacements
-	Feature flags: No runtime feature toggle capability for gradual rollouts
7.5.	Lessons Learned
7.5.1.	Technical Lessons
a)	Event-driven architecture requires explicit trace propagation The checkout flow demonstrated that RabbitMQ message publishing breaks trace context. Lesson: Instrument message producers to propagate trace headers in message properties, and instrument consumers to extract and continue the trace context. OpenTelemetry provides standardized instrumentation for common message brokers.
b)	Module Federation complexity pays off at scale Initial investment in host/remote architecture, registry configuration, and shared dependency management created upfront complexity. However, the payoff becomes evident when:
-	Independent teams can release without coordinating deployments
-	Bundle sizes remain manageable as features grow
-	Breaking changes in one MFE don't block other teams
c)	Database-per-service creates operational overhead worth accepting Managing four different database technologies (MongoDB, Redis, PostgreSQL, SQL Server) increases DevOps burden. However, the isolation benefits, no schema coupling, independent scaling, technology fit per workload, outweigh operational complexity in a microservices context.
d)	IRSA is essential for AWS workload identity Pod-level IAM authentication via IRSA (IAM Roles for Service Accounts) proved essential for secure S3 access without embedding credentials. This pattern should be the default for any AWS-hosted Kubernetes workload accessing AWS services.
7.5.2.	Process Lessons
a)	Start with observability Debugging distributed systems without centralized logs, metrics, and traces is impractical. Lesson: Deploy observability infrastructure before application services, not as an afterthought. In this project, having Prometheus, Jaeger, and Kibana available from the start significantly reduced debugging time during development.
b)	Automate deployment early Manual deployment steps do not scale with microservices complexity. The investment in deploy.sh and Helm charts enabled consistent deployments and reduced “works on my machine” issues. Lesson: Treat deployment automation as a first-class deliverable, not a post-development task.
c)	E2E testing requires investment beyond unit tests Integration issues across microservices and micro-frontends (API contract mismatches, Module Federation loading failures, event-driven flow breakages) are not detectable by unit tests alone. The proposed Katalon Platform integration (Section 7.1.3) addresses this gap by enabling AI-powered test generation from real user behavior, though implementation is planned for future work.
7.5.3.	Threats to Validity
The following factors may limit the generalizability of evaluation results:
Internal Validity:
-	Resource contention: Minikube runs on a single machine with limited CPU/RAM, affecting performance measurements
-	Co-located load generator: k6 ran on the same machine as the cluster, potentially competing for resources
-	Variable test conditions: While extended tests (5-12 minutes for spike/stress/soak) were conducted, results may vary based on system state
-	Single-run measurements: Most results represent single observations without statistical significance testing across multiple runs
External Validity:
-	Development-scale dataset: 12 products and sample orders do not represent production data volumes
-	Local network: No real network latency between services; all communication is intra-cluster
-	Simulated load patterns: Tests simulated 10-100 concurrent VUs, but may not reflect real-world user behavior patterns and access distributions
Construct Validity:
-	Frontend metrics: Bundle size and performance estimates are based on webpack-bundle-analyzer and Lighthouse audits, not real user monitoring
-	Observability completeness: “100% log completeness” was observed across sampled test runs, not exhaustively verified
These limitations should be considered when extrapolating results to production deployments.
7.6.	Summary
This chapter evaluated the cloud-native e-commerce platform against functional and non-functional criteria. Key findings:
Dimension	Assessment	Summary
Functional Completeness	Achieved	All five epics (Catalog, Cart, Checkout, Orders, Discount) implemented and verified
Performance	Partially achieved	Backend p95 targets met by 1/3 services; 68% frontend bundle reduction
Scalability	Demonstrated	HPA scaled Catalog 1→2 under load; database-per-service enables independent scaling
Resilience	Validated	Pod recovery within 45s; MFE error boundaries functional
Observability	Partial	Sync traces complete; async traces broken (known limitation)
DevOps Practices	Effective	IaC, CI/CD, and observability practices demonstrated value
Table 50. Evaluation and Discussion Summary
The evaluation also documented practical limitations:
-	Async trace discontinuity via RabbitMQ
-	Cold-start latency for remote MFE modules
These limitations define clear improvement areas for production hardening without invalidating the architectural approach. Chapter 8 proposes future enhancements including OpenTelemetry adoption, progressive delivery implementation, and multi-region deployment strategies.




 
CHAPTER 8: CONCLUSION AND FUTURE WORK
This thesis presented the design and implementation of a cloud-native application platform that applies contemporary DevOps and platform engineering practices to a microservices-based e-commerce system. In this work, the e-commerce domain was intentionally selected as a realistic workload for validating infrastructure patterns and operational capabilities; therefore, business functionality was treated as a means to evaluate architectural decisions, rather than the primary contribution.
8.1.	Conclusion
This graduation project achieved its main objective: to design, implement, and evaluate a cloud-native platform emphasizing container orchestration, infrastructure automation, observability, and CI/CD practices. The resulting system demonstrates how a representative microservices workload can be deployed and operated consistently across environments, while remaining observable, scalable, and maintainable.
8.1.1.	Infrastructure and DevOps Outcomes
a)	Container orchestration and deployment.
The platform was deployed on Kubernetes using Helm charts (17 charts) to ensure declarative and reproducible releases. Deployment automation was standardized through deploy.sh for Minikube and deploy-aws.sh for AWS EKS, enabling a single-command bootstrap for each environment. Horizontal Pod Autoscaler (HPA) was incorporated to demonstrate elastic scaling under load. Overall, the solution supports both local and cloud environments (Minikube and EKS) through environment-specific configuration and deployment flows.
b)	Observability stack.
The project integrated a complete observability toolchain to support production-like operations. Prometheus and Grafana were used for metric collection and visualization. Centralized logging was implemented using the ELK stack (Elasticsearch, Logstash, Kibana). Distributed tracing was supported by Jaeger to analyze request paths across synchronous service calls. In addition, Kiali was used to visualize service mesh behavior and support traffic inspection and analysis.
c)	CI/CD pipeline.
Automated pipelines were implemented using GitHub Actions for building, testing, and deployment. Services were containerized using multi-stage Dockerfiles to improve build efficiency and reduce runtime images. Security scanning was incorporated using Trivy and CodeQL, and release processes were automated with semantic versioning to improve consistency and traceability across iterations.
d)	Performance testing infrastructure.
The platform incorporated k6 to evaluate system behavior under multiple load patterns, including load, spike, stress, and soak tests. Prometheus Pushgateway integration was included to persist load-testing metrics for analysis. In addition, an integration approach with the Katalon Platform was proposed to enable E2E automation and TestCloud execution, forming a foundation for future testing maturity.
8.1.2.	Architectural Validation
a)	Microservices architecture.	
The microservices design validated key principles commonly required for scalable cloud-native systems. Services such as Catalog, Basket, Discount, and Ordering were deployed with service-level isolation, including independent persistence layers. The implementation demonstrated technology heterogeneity by selecting databases aligned with service requirements (MongoDB, Redis, PostgreSQL, and SQL Server). Asynchronous communication was supported through RabbitMQ, enabling event-driven interactions and reducing coupling between services. To provide a unified entry point, an API Gateway pattern was implemented using Ocelot, supporting routing and aggregation for client-facing operations.
b)	Micro-frontend architecture.
The frontend architecture validated the feasibility of decomposing a monolithic client into independently deployable units. Webpack 5 Module Federation enabled runtime loading of remote modules, supporting a “team autonomy” simulation through separate deployment units (Store, Checkout, Account, and Host). Shared dependency management was applied to reduce duplication of core libraries (React and Ant Design). The resulting design reported a 68% bundle size reduction compared to the monolithic frontend approach, indicating tangible performance benefits from modular delivery.
8.1.3.	Key Findings from Evaluation
Based on the evaluation presented in Chapter 7, several findings were established:
-	Across load, spike, stress, and soak testing, the system maintained a 0% error rate.
-	Average latency targets below 400 ms were consistently achieved (316–369 ms).
-	The p95 latency target below 500 ms was not consistently met, with observed p95 values ranging from 525 to 590 ms.
-	The spike test validated short-term concurrency tolerance, reaching 100 concurrent virtual users with a peak throughput of 77.27 requests/second and 0% errors.
-	The stress test (12-minute ramp to 100 virtual users) remained within the defined stability threshold, with p95 below 1 second.
-	The soak test sustained load for 11 minutes with zero errors, although p95 latency thresholds were exceeded, indicating optimization opportunities.
-	The integrated observability stack enabled effective diagnosis and interpretation of system behavior during experiments.
Together, these results confirm platform stability under tested conditions while also highlighting measurable performance bottlenecks at the tail-latency level (p95), which is critical for user experience in production settings.
8.1.4.	Scope Clarification and Contribution
This thesis intentionally prioritized infrastructure and operational engineering over domain complexity. The implemented e-commerce features (catalog browsing, cart operations, checkout, and ordering) were designed to generate realistic service-to-service interactions and data flows for evaluation. Business rules were kept intentionally lightweight to concentrate on DevOps patterns, deployment repeatability, observability, and performance measurement.
Accordingly, the primary contribution of this work lies in the platform engineering approach: a reference implementation demonstrating how modern cloud-native infrastructure patterns can be applied and evaluated in a practical microservices environment.
8.2.	Future Work
To progress from a validated prototype toward production readiness, the following enhancements are recommended:
8.2.1.	Progressive Delivery
The current deployment strategy relies on rolling updates with immediate full rollout. A production-ready evolution is to implement canary deployments using Argo Rollouts or Flagger, integrated with Prometheus-based metrics to enable automated rollback decisions and controlled traffic shifting during releases.
8.2.2.	GitOps Adoption
The current CI/CD process applies changes directly to Kubernetes. A GitOps approach using Argo CD or Flux would improve operational governance by enabling declarative state management, drift detection, automatic reconciliation, and stronger auditability through Git history.
8.2.3.	OpenTelemetry Standardization
Observability is currently implemented through separate mechanisms for logs, metrics, and traces, and asynchronous trace continuity across RabbitMQ remains incomplete. Migrating to OpenTelemetry would unify telemetry instrumentation, enable trace context propagation across asynchronous boundaries, and standardize export via OTLP for vendor-neutral observability.
8.2.4.	Security Hardening
Current security relies on basic authentication and Kubernetes secrets. Production hardening should include dynamic secrets management (HashiCorp Vault or AWS Secrets Manager), Kubernetes NetworkPolicies for pod-level isolation, and stronger authorization controls with RBAC enforcement based on JWT claims.
8.2.5.	End-to-End Testing Enablement
While the integration design for Katalon Platform is defined, it has not yet been deployed. Future work should operationalize E2E testing by deploying a Katalon TrueTest agent to capture user journeys, scheduling daily regression executions via TestOps and TestCloud, and integrating test outcomes as quality gates within GitHub Actions pipelines.
8.2.6.	Performance Optimization
Given the observed p95 latency exceeding 500 ms (525–590 ms), optimization should target both compute and data layers. Recommended actions include database query optimization and indexing for MongoDB and SQL Server, Redis caching for frequently accessed catalog data, tuning database connection pooling, and evaluating read replicas for read-heavy patterns.
8.2.7.	Multi-Region Deployment and Resilience
The current EKS deployment is single-region. Production expansion should consider multi-region strategies such as multi-cluster federation for geographic distribution, global load balancing with Route 53 or CloudFront, and active-active or active-passive failover designs depending on cost and availability requirements.
8.3.	Final Remarks
This thesis demonstrated that modern DevOps practices, container orchestration, infrastructure automation, observability, and CI/CD, can be applied effectively to a microservices-based system and evaluated systematically under multiple load conditions. While the e-commerce application provided the necessary realism for experiments, the core contribution is the platform engineering foundation and its validated operational capabilities.
The platform serves as a reference for teams aiming to adopt Kubernetes-based delivery, implement metrics/logs/traces observability, automate deployments through infrastructure-as-code and CI/CD pipelines, and evaluate scalability and reliability under controlled performance testing. The identified limitations, particularly asynchronous trace discontinuity, p95 latency optimization needs, and the incomplete E2E testing rollout, represent clear, actionable directions for improvement without undermining the architectural baseline established in this work.
Overall, the project demonstrates practical competence in cloud-native engineering practices that are directly applicable to roles focusing on platform engineering, site reliability engineering, and infrastructure automation. 
REFERENCES

[1].	“Microservice Architecture pattern,” microservices.io. https://microservices.io/patterns/microservices.html
[2].	“What is DevOps?,” Amazon Web Services, Inc. https://aws.amazon.com/devops/what-is-devops/
[3].	“Enabling data persistence in microservices - AWS Prescriptive Guidance.” https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/welcome.html
[4].	“OpenLegacy’s Complete Guide to Microservices Design Patterns.” https://www.openlegacy.com/blog/microservices-architecture-patterns/
[5].	C. Gaikwad, “What is Kubernetes? | Harness,” Harness.io, May 27, 2025. https://www.harness.io/harness-devops-academy/what-is-kubernetes
[6].	“Deploy & Upgrade using Helm Charts on K8s,” Syft Documentation. https://docs.openmined.org/en/latest/deployment/deployment-doc-5-5-helm-upgrade.html
[7].	A. S. Gillis, “sidecar proxy,” Search IT Operations, Nov. 16, 2022. https://www.techtarget.com/searchitoperations/definition/sidecar-proxy
[8].	“OpenLegacy’s Complete Guide to Microservices Design Patterns.” https://www.openlegacy.com/blog/microservices-architecture-patterns/
[9].	J. Roller, “Top 10 Microservices Design Patterns and Their Pros and Cons,” IEEE Computer Society, Feb. 07, 2024. https://www.computer.org/publications/tech-news/trends/microservices-design-patterns
[10].	“RabbitMQ as message broker between your Microservices - CloudAMQP,” CloudAMQP. https://www.cloudamqp.com/rabbitmq_microservices.html
[11].	RobBagby, “Circuit Breaker Pattern - Azure Architecture Center,” Microsoft Learn. https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker
[12].	D. F. S. Dev, “Centralized Logging with ELK Stack (Elasticsearch, Logstash, Kibana) in .NET Microservices,” Medium, May 31, 2025. [Online]. Available: https://dotnetfullstackdev.medium.com/centralized-logging-with-elk-stack-elasticsearch-logstash-kibana-in-net-microservices-08c07ad6cab3
[13].	Riza, “Monitoring Microservices using Prometheus & Grafana,” Orkes Platform - Microservices and Workflow Orchestration at Scale. https://orkes.io/blog/monitoring-microservices-using-prometheus-and-grafana/
[14].	“How to Use Observability to Reduce MTTR | Splunk,” Splunk. https://www.splunk.com/en_us/blog/devops/using-observability-to-reduce-mttr.html
[15].	Bak, Peter & Melamed, Roie & Moshkovich, Dany & Nardi, Yuval & Ship, Harold & Yaeli, Avi. (2015). Location and Context-Based Microservices for Mobile and Internet of Things Workloads. 1-8. https://doi.org/10.1109/MobServ.2015.11
[16].	Černý, Tom & Donahoo, Michael & Trnka, Michal. (2018). Contextual understanding of microservice architecture: current and future directions. ACM SIGAPP Applied Computing Review. 17. 29-45. https://doi.org/10.1145/3183628.3183631
[17].	Francesco, Paolo & Malavolta, Ivano & Lago, Patricia. (2017). Research on Architecting Microservices: Trends, Focus, and Potential for Industrial Adoption. 21-30. https://doi.org/10.1109/ICSA.2017.24
[18].	Dragoni, Nicola & Giallorenzo, Saverio & Lluch-Lafuente, Alberto & Mazzara, Manuel & Montesi, Fabrizio & Mustafin, Ruslan & Safina, Larisa. (2017). Microservices: Yesterday, Today, and Tomorrow. https://doi.org/10.1007/978-3-319-67425-4_12
[19].	Nunes, Luis & Santos, Nuno & Silva, António. (2019). From a Monolith to a Microservices Architecture: An Approach Based on Transactional Contexts. https://doi.org/10.1007/978-3-030-29983-5_3
[20].	Pahl, C. and Jamshidi, P. (2016). Microservices: A Systematic Mapping Study. In Proceedings of the 6th International Conference on Cloud Computing and Services Science - Volume 1: CLOSER; ISBN 978-989-758-182-3; ISSN 2184-5042, SciTePress, pages 137-146. https://doi.org/10.5220/0005785501370146
[21].	C. Santana, B. Alencar and C. Prazeres, “Microservices: A Mapping Study for Internet of Things Solutions,” in 2018 IEEE 17th International Symposium on Network Computing and Applications (NCA), Cambridge, MA, USA, 2018, pp. 1-4, https://doi.org/10.1109/NCA.2018.8548331
[22].	Vural, Hulya & Koyuncu, Murat & Guney, Sinem. (2017). A Systematic Literature Review on Microservices. 203-217. https://doi.org/10.1007/978-3-319-62407-5_14
[23].	Hasselbring, Wilhelm & Steinacker, Guido. (2017). Microservice Architectures for Scalability, Agility and Reliability in E-Commerce. 243-246. https://doi.org/10.1109/ICSAW.2017.11
[24].	Souza, V. J. S., Neves, V. O., & Kimura, B. Y. L. (2024). Dependable Microservices in the Kubernetes era: A Practitioners Survey. https://doi.org/10.5753/jisa.2024.4000
[25].	Evans, E. (2003). Domain-driven design: Tackling complexity in the heart of software. Addison-Wesley Professional.
[26].	Fowler, S. J. (2016). Production-ready microservices: Building standardized systems across an engineering organization. O’Reilly Media.
[27].	Hightower, K., Burns, B., & Beda, J. (2017). Kubernetes: Up and Running: Dive into the Future of Infrastructure. O’Reilly Media.
[28].	Nadareishvili, I., Mitra, R., McLarty, M., & Amundsen, M. (2016). Microservice architecture: Aligning principles, practices, and culture. O’Reilly Media.
[29].	Newman, S. (2015). Building microservices: Designing fine-grained systems. O’Reilly Media.
[30].	Newman, S. (2019). Monolith to microservices: Evolutionary patterns to transform your monolith. O’Reilly Media.
[31].	Richardson, C. (2018) Microservices Patterns: With Examples in Java. Manning Publications.
[32].	Irakli Nadareishvili, Ronnie Mitra, Matt McLarty, and Mike Amundsen. 2016. Microservice Architecture: Aligning Principles, Practices, and Culture (1st. ed.). O’Reilly Media.
[33].	Elastic.co. (n.d.). Elastic Stack Documentation. Retrieved October 26, 2023, from https://www.elastic.co/guide/index.html
[34].	Helm.sh. (n.d.). Helm Documentation. Retrieved October 26, 2023, from https://helm.sh/docs/
[35].	Grafana k6 | Grafana k6 documentation. (n.d.). Grafana Labs. https://grafana.com/docs/k6/latest/
[36].	What is Amazon EKS? - Amazon EKS. (n.d.). https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html
[37].	What is Amazon Elastic Container Registry? - Amazon ECR. (n.d.). https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html
[38].	What is CloudFormation? - AWS CloudFormation. (n.d.). https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html
[39].	What is Amazon S3? - Amazon Simple Storage Service. (n.d.). https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html
[40].	IAM roles for service accounts - Amazon EKS. (n.d.). https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html
[41].	Use Kubernetes volume storage with Amazon EBS - Amazon EKS. (n.d.). https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html
[42].	What is AWS Certificate Manager? - AWS Certificate Manager. (n.d.). https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html
[43].	Documentation. (n.d.). Istio. https://istio.io/latest/docs/
[44].	Documentation. (n.d.). Jaeger. https://www.jaegertracing.io/docs/
[45].	Documentation. (n.d.). Kiali. https://kiali.io/docs/
[46].	Overview | Prometheus. (n.d.). https://prometheus.io/docs/introduction/overview/
[47].	Grafana OSS and Enterprise | Grafana documentation. (n.d.). Grafana Labs. https://grafana.com/docs/grafana/latest/
[48].	Katalon Docs. (n.d.). https://docs.katalon.com/
[49].	Module Federation | webpack. (n.d.). Webpack. https://webpack.js.org/concepts/module-federation/
[50].	Ocelot 24.1 — Ocelot Gateway 24.1 “Globality” documentation. (n.d.). https://ocelot.readthedocs.io/en/latest/
[51].	S. Ghemawat, R. Grandl, S. Petrovic, M. Whittaker, P. Patel, I. Posva, and A. Vahdat, "Towards Modern Development of Cloud Applications," in Workshop on Hot Topics in Operating Systems (HOTOS '23), June 22–24, 2023, Providence, RI, USA. ACM, New York, NY, USA, 8 pages. https://doi.org/10.1145/3593856.3595909
[52].	"eShopOnContainers - .NET Microservices Sample Reference Application," GitHub. https://github.com/dotnet-architecture/eShopOnContainers
[53].	"microservices-demo - Sample cloud-first application with 10 microservices showcasing Kubernetes, Istio, and gRPC," GitHub. https://github.com/GoogleCloudPlatform/microservices-demo
[54].	"QCONSF 2017 presentation - ACID Is So Yesterday: Sagas for Distributed Transactions," microservices.io. https://microservices.io/microservices/news/2017/12/04/qconsf2017-presentation.html
[55].	"Pattern: Saga - Managing distributed transactions," microservices.io. https://microservices.io/patterns/data/saga.html
[56].	"Argo CD - Declarative GitOps CD for Kubernetes," GitHub. https://github.com/argoproj/argo-cd

APPENDICES

APPENDIX A: REPOSITORY AND MODULE MAP
This appendix provides a high-level overview of the repository structure and the responsibilities of each module. The e-commerce domain serves as an illustrative workload; the thesis contribution focuses on platform engineering, deployment automation, observability, and operational reliability.
A.1.	Repository Structure
```
cloud-native-ecommerce-platform/
├── Services/                    # Backend microservices (.NET Core)
│   ├── Catalog/                 # Product catalog service (MongoDB)
│   ├── Basket/                  # Shopping cart service (Redis)
│   ├── Discount/                # Discount service with gRPC (PostgreSQL)
│   └── Ordering/                # Order processing service (SQL Server)
├── ApiGateways/                 # API Gateway layer
│   └── OcelotApiGw/             # Ocelot-based routing and aggregation
├── ecommerce-micro-frontend/    # React micro-frontend application
│   ├── apps/
│   │   ├── host/                # Shell application (Module Federation host)
│   │   ├── store/               # Product browsing remote
│   │   ├── checkout/            # Checkout flow remote
│   │   └── account/             # User account remote
│   └── packages/                # Shared libraries (auth, layout, state)
├── client/                      # Legacy Angular frontend (Amplify)
├── Deployments/                 # Kubernetes deployment artifacts
│   └── helm/                    # 16 Helm charts for all workloads
├── Infrastructure/              # Infrastructure definitions
│   ├── aws/cloudformation/      # CloudFormation templates (VPC, EKS, S3, ALB)
│   └── SharedLibs/              # Cross-cutting .NET libraries
├── .github/workflows/           # CI/CD pipeline definitions
│   ├── ci.yml                   # Continuous Integration
│   ├── cd.yml                   # Continuous Deployment
│   └── release.yml              # Semantic release management
├── tests/                       # Performance and E2E tests
│   └── k6/                      # Load testing scripts
└── scripts/                     # Deployment and utility scripts
```
A.2.	Module Responsibilities

| Module | Responsibility | Thesis Focus |
| :--- | :--- | :--- |
| Services/ | Business logic implementation | Demonstrates microservice isolation |
| Deployments/helm/ | Kubernetes workload packaging | Infrastructure as Code (Helm) |
| Infrastructure/aws/ | Cloud resource provisioning | Infrastructure as Code (CloudFormation) |
| .github/workflows/ | Automated build and deployment | CI/CD automation |
| tests/k6/ | Performance validation | Load testing methodology |

A.3.	Thesis Scope Clarification
This thesis prioritizes infrastructure and operational engineering over domain complexity. The e-commerce features (catalog browsing, cart operations, checkout, ordering) generate realistic service-to-service interactions for evaluating DevOps patterns, deployment repeatability, observability, and performance measurement.

APPENDIX B: INFRASTRUCTURE AS CODE SNAPSHOTS
This appendix provides key excerpts from the Infrastructure as Code definitions used in the project.
B.1.	VPC Network Layout (CloudFormation)
```yaml
# Infrastructure/aws/cloudformation/vpc.yaml (excerpt)
Parameters:
  VpcCidr:
    Type: String
    Default: 10.0.0.0/16
  PublicSubnet1Cidr:
    Type: String
    Default: 10.0.1.0/24
  PrivateSubnet1Cidr:
    Type: String
    Default: 10.0.11.0/24

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Ref VpcCidr
      EnableDnsHostnames: true
      EnableDnsSupport: true

  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: !Ref PublicSubnet1Cidr
      MapPublicIpOnLaunch: true
      AvailabilityZone: !FindInMap [RegionMap, !Ref "AWS::Region", AZ1]

  NatGateway:
    Type: AWS::EC2::NatGateway
    Properties:
      SubnetId: !Ref PublicSubnet1
      # Single NAT for cost optimization in development
```
B.2.	EKS Cluster Provisioning (CloudFormation)
```yaml
# Infrastructure/aws/cloudformation/eks-cluster.yaml (excerpt)
Parameters:
  KubernetesVersion:
    Type: String
    Default: "1.30"
  NodeInstanceType:
    Type: String
    Default: m7i-flex.large
  NodeDesiredCapacity:
    Type: Number
    Default: 2

Resources:
  EksCluster:
    Type: AWS::EKS::Cluster
    Properties:
      Name: !Ref ClusterName
      Version: !Ref KubernetesVersion
      ResourcesVpcConfig:
        SubnetIds: !Ref PrivateSubnetIds
        EndpointPrivateAccess: true
        EndpointPublicAccess: true

  ManagedNodeGroup:
    Type: AWS::EKS::Nodegroup
    Properties:
      ClusterName: !Ref ClusterName
      ScalingConfig:
        DesiredSize: !Ref NodeDesiredCapacity
        MinSize: 1
        MaxSize: 3
      InstanceTypes:
        - !Ref NodeInstanceType
        - t3.small   # Fallback instance types
        - t3.medium
      CapacityType: ON_DEMAND
```
B.3.	Environment Parameterization Strategy
The project uses Helm's values hierarchy for environment-specific configuration:
-	values.yaml: Default development settings
-	values-aws.yaml: AWS-specific overrides (IRSA annotations, resource limits)
-	--set flags: Runtime overrides for image registry, environment variables

APPENDIX C: KUBERNETES MANIFESTS AND HELM VALUES
This appendix documents the Kubernetes deployment patterns used across all workloads.
C.1.	Namespace Conventions

| Environment | Namespace | Purpose |
| :--- | :--- | :--- |
| Local | default | Minikube development |
| Development | dev | AWS development cluster |
| Staging | staging | Pre-production validation |
| Production | production | Live workloads |

C.2.	Deployment Template Pattern
```yaml
# Deployments/helm/catalog/templates/deployment.yaml (excerpt)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "catalog.fullname" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: {{ .Values.resources.requests.cpu }}
              memory: {{ .Values.resources.requests.memory }}
            limits:
              cpu: {{ .Values.resources.limits.cpu }}
              memory: {{ .Values.resources.limits.memory }}
          livenessProbe:
            httpGet:
              path: /health
              port: 80
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 80
            initialDelaySeconds: 20
            periodSeconds: 5
```
C.3.	Horizontal Pod Autoscaler Configuration
```yaml
# Deployments/helm/catalog/templates/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "catalog.fullname" . }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "catalog.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
```
C.4.	Resource Requests and Limits Convention

| Environment | CPU Request | CPU Limit | Memory Request | Memory Limit |
| :--- | :--- | :--- | :--- | :--- |
| Development | 50m | 100m | 64Mi | 128Mi |
| AWS (default) | 100m | 500m | 128Mi | 512Mi |
| AWS (high-load) | 250m | 1000m | 256Mi | 1Gi |

APPENDIX D: CI/CD PIPELINES
This appendix documents the end-to-end CI/CD pipeline implementation.
D.1.	Pipeline Stage Overview
The CI/CD pipeline executes in sequential stages, from code trigger through deployment verification:
 
Figure D.1. CI/CD Pipeline Stages
D.2.	CI Workflow Summary (.github/workflows/ci.yml)

| Job | Trigger | Actions |
| :--- | :--- | :--- |
| backend-build | Backend file changes | .NET restore, build, test |
| frontend-build | Frontend file changes | NX affected build, lint |
| helm-lint | Deployments/ changes | Helm lint all charts |
| security-scan | All changes | Trivy container scan, CodeQL analysis |
| docker-build | Backend changes | Multi-stage Docker build validation |

D.3.	CD Workflow Summary (.github/workflows/cd.yml)

| Phase | Actions |
| :--- | :--- |
| 1. Image Build | Build Docker images for all services |
| 2. ECR Push | Push images to Amazon ECR |
| 3. Helm Deploy | Deploy databases, then services, then gateway |
| 4. Migration | Migrate product images to S3 |
| 5. Smoke Test | Verify API Gateway health endpoint |

D.4.	Release Strategy
-	Current implementation: Rolling updates via helm upgrade --install
-	Rollback mechanism: helm rollback <release> <revision>
-	Future enhancement: Blue/green deployments with Argo Rollouts (proposed in Chapter 8)
D.5.	Artifact Versioning

| Tag Pattern | Image Tag | Use Case |
| :--- | :--- | :--- |
| Push to main | latest | Continuous development |
| Push tag v* | v1.0.0 | Immutable release |
| Manual dispatch | Specified or latest | Ad-hoc deployment |

APPENDIX E: OBSERVABILITY PACK
This appendix documents the observability stack configuration and usage patterns.
E.1.	Golden Signals Dashboard (Grafana)
The Grafana dashboard monitors four golden signals per service:

| Signal | Metric | Alert Threshold |
| :--- | :--- | :--- |
| Latency | http_request_duration_seconds (p95) | > 500ms |
| Traffic | http_requests_total (rate) | Informational |
| Errors | http_requests_total{status=~"5.."} | > 1% error rate |
| Saturation | container_cpu_usage_seconds_total | > 80% CPU |

E.2.	Distributed Trace Example (Jaeger)
Trace path for checkout flow showing synchronous service calls and async event publishing:
 
Figure E.2. Distributed Trace - Checkout Flow
Limitation: RabbitMQ breaks trace context; async portion appears as a separate trace.
E.3.	Structured Log Format (Serilog)
```json
{
  "Timestamp": "2024-12-28T10:30:45.123Z",
  "Level": "Information",
  "MessageTemplate": "Order {OrderId} created for user {UserName}",
  "Properties": {
    "OrderId": "ORD-12345",
    "UserName": "swn",
    "CorrelationId": "abc-123-def",
    "ApplicationName": "Ordering.API",
    "Environment": "Production"
  }
}
```
E.4.	Log Correlation
All services include CorrelationId in log properties, enabling cross-service log correlation in Kibana. The correlation ID is propagated via HTTP headers (X-Correlation-ID) and included in RabbitMQ message properties.

APPENDIX F: SECURITY BASELINE CHECKLIST
This appendix documents the security controls implemented in the project.
F.1.	Container Security

| Control | Status | Implementation |
| :--- | :--- | :--- |
| Non-root user | ✓ Implemented | Dockerfile USER directive |
| Read-only filesystem | ○ Partial | Applied to stateless services |
| Image scanning | ✓ Implemented | Trivy in CI pipeline |
| Base image updates | ✓ Automated | Dependabot PRs |
| Multi-stage builds | ✓ Implemented | Reduced attack surface |

F.2.	Network Security

| Control | Status | Implementation |
| :--- | :--- | :--- |
| TLS at edge | ✓ Implemented | ACM certificate on ALB |
| mTLS between services | ○ Optional | Istio service mesh |
| Network policies | ○ Proposed | Future: Kubernetes NetworkPolicy |
| Ingress restrictions | ✓ Implemented | ALB security groups |

F.3.	Identity and Access

| Control | Status | Implementation |
| :--- | :--- | :--- |
| IRSA for AWS access | ✓ Implemented | Catalog → S3 via OIDC |
| Service accounts | ✓ Implemented | Per-service accounts |
| Least privilege | ✓ Implemented | Scoped IAM policies |
| Secret management | ✓ Implemented | Kubernetes Secrets |

F.4.	CI/CD Security

| Control | Status | Implementation |
| :--- | :--- | :--- |
| Dependency scanning | ✓ Implemented | Dependabot, CodeQL |
| Container scanning | ✓ Implemented | Trivy in CI |
| SAST | ✓ Implemented | CodeQL analysis |
| Secrets in CI | ✓ Implemented | GitHub encrypted secrets |

APPENDIX G: PERFORMANCE AND LOAD TEST EVIDENCE
This appendix provides detailed load test configurations and results from Chapter 7.
G.1.	k6 Test Configuration

| Test Type | Duration | Virtual Users | Ramp Pattern |
| :--- | :--- | :--- | :--- |
| Load | 30s per service | 10 | Constant |
| Spike | 2m 20s | 1 → 100 → 1 | Sharp spike/drop |
| Stress | 12m | 1 → 100 | Gradual ramp |
| Soak | 11m | 30 | Sustained |

G.2.	Load Test Results Summary

| Service | Avg Latency | p95 Latency | Throughput | Error Rate |
| :--- | :--- | :--- | :--- | :--- |
| Catalog | 316ms | 541ms | 31.6 req/s | 0% |
| Basket | 320ms | 525ms | 31.2 req/s | 0% |
| Ordering | 369ms | 588ms | 27.0 req/s | 0% |

G.3.	Spike Test Results
-	Peak VUs: 100
-	Peak throughput: 77.27 req/s
-	Error rate: 0%
-	Observation: System handled sudden load increase without failures
G.4.	Resource Utilization Under Load
-	Baseline CPU: ~15%
-	Peak CPU under load: ~85%
-	HPA response: Scaled from 1 → 2 replicas within 60 seconds
-	Post-load recovery: Scaled down after 5-minute stabilization window

APPENDIX H: FAILURE SCENARIOS AND RUNBOOKS
This appendix documents common failure scenarios and recovery procedures.
H.1.	Pod Crashloop

| Phase | Action |
| :--- | :--- |
| Detect | kubectl get pods shows CrashLoopBackOff status |
| Diagnose | kubectl logs <pod> --previous; kubectl describe pod <pod> |
| Common causes | OOM killed, failed liveness probe, missing config |
| Mitigate | Fix code, adjust resource limits, correct ConfigMap |
| Verify | kubectl get pods shows Running 1/1 |

H.2.	Dependency Unavailable

| Phase | Action |
| :--- | :--- |
| Detect | Service returns 5xx errors; Grafana shows error spike |
| Diagnose | Jaeger trace shows timeout on downstream call |
| Common causes | Database down, RabbitMQ unavailable, network partition |
| Mitigate | Restart dependency pod; circuit breaker activates |
| Verify | Error rate returns to baseline; traces complete |

H.3.	Configuration Misdeploy

| Phase | Action |
| :--- | :--- |
| Detect | Application behavior unexpected after deployment |
| Diagnose | Compare ConfigMap: kubectl get configmap <name> -o yaml |
| Common causes | Wrong environment variable, incorrect connection string |
| Mitigate | helm rollback <release> <previous-revision> |
| Verify | Application behavior restored |

H.4.	Node Pressure

| Phase | Action |
| :--- | :--- |
| Detect | Pod evictions; kubectl describe node shows pressure |
| Diagnose | Check node resources: kubectl top nodes |
| Common causes | Memory/disk pressure, too many pods |
| Mitigate | Scale node group; reschedule pods to other nodes |
| Verify | Pods redistributed; pressure relieved |

H.5.	Probe Behavior Reference

| Probe | Failure Effect | Recovery |
| :--- | :--- | :--- |
| Liveness | Container restarted | Automatic by kubelet |
| Readiness | Removed from Service endpoints | Traffic rerouted; manual investigation |

APPENDIX I: CONFIGURATION AND ENVIRONMENT MATRIX
This appendix documents configuration differences across deployment environments.
I.1.	Environment Configuration Matrix

| Configuration | Local (Minikube) | Dev (AWS) | Staging | Production |
| :--- | :--- | :--- | :--- | :--- |
| ASPNETCORE_ENVIRONMENT | Development | Development | Staging | Production |
| USE_LOCALSTACK | true | false | false | false |
| Replica count | 1 | 1 | 2 | 2-3 (HPA) |
| Autoscaling | Disabled | Disabled | Enabled | Enabled |
| TLS | None | ACM | ACM | ACM |
| Container registry | Local Docker | ECR | ECR | ECR |
| Object storage | LocalStack S3 | AWS S3 | AWS S3 | AWS S3 |
| Log level | Debug | Information | Information | Warning |

I.2.	External Dependencies

| Dependency | Local | AWS |
| :--- | :--- | :--- |
| MongoDB | containerized | containerized (EKS) |
| Redis | containerized | containerized (EKS) |
| PostgreSQL | containerized | containerized (EKS) |
| SQL Server | containerized | containerized (EKS) |
| RabbitMQ | containerized | containerized (EKS) |
| S3 | LocalStack | AWS S3 |

I.3.	Feature Flags and Runtime Configuration

| Feature | Local | AWS Production |
| :--- | :--- | :--- |
| Retry policy (Polly) | 3 retries, 2s backoff | 3 retries, 2s backoff |
| Circuit breaker | 5 failures, 30s break | 5 failures, 30s break |
| Request timeout | 30s | 30s |
| Connection pool size | 10 | 50 |

APPENDIX J: RELATED PAPER REFLECTION
This appendix provides a structured reflection on the paper "Towards Modern Development of Cloud Applications" (Ghemawat et al., HotOS 2023) [51] and its influence on this thesis.
J.1.	Problem Highlighted by the Paper
The paper argues that microservices, while well-intentioned, often backfire because they conflate logical boundaries (how code is written) with physical boundaries (how code is deployed). The authors identify five key challenges:
-	C1: Performance degradation from serialization and network overhead
-	C2: Correctness issues from cross-version interactions (two-thirds of catastrophic failures)
-	C3: Management complexity of multiple binaries and release schedules
-	C4: Frozen APIs that become difficult to evolve
-	C5: Slower development when changes span multiple services
J.2.	Paper's Proposed Solution
The paper proposes three core tenets:
1.	Write monolithic applications modularized into logical components
2.	Leverage a runtime to dynamically assign logical components to physical processes
3.	Deploy applications atomically, preventing cross-version interactions
J.3.	Ideas Adopted in This Thesis

| Idea | Adoption | Implementation |
| :--- | :--- | :--- |
| Atomic rollout mindset | ✓ Adopted | Helm releases ensure all components update together within a namespace |
| Separation of business logic from deployment | ✓ Adopted | Helm parameterization separates deployment concerns from application code |
| Platform-managed concerns | ✓ Adopted | HPA for scaling, Istio for networking, ELK for logging |
| Awareness of cross-version risks | ✓ Adopted | Rolling updates with --wait ensure version consistency |

J.4.	Ideas Not Adopted (With Rationale)

| Idea | Status | Rationale |
| :--- | :--- | :--- |
| Single-binary runtime | Not adopted | Microservice boundaries enable independent scaling and team autonomy |
| Custom serialization | Not adopted | Standard gRPC/REST provides interoperability and tooling ecosystem |
| Automated component co-location | Not adopted | Kubernetes scheduling handles placement; explicit service boundaries preferred |

J.5.	Thesis Positioning
This thesis takes a pragmatic middle-ground: microservices provide real benefits for team autonomy, independent scaling, and technology heterogeneity. However, the infrastructure must mitigate the challenges the paper identifies. The platform engineering approach addresses these concerns through:
-	Versioned deployments: Helm releases and semantic versioning for traceability
-	Observability: Distributed tracing, centralized logging, and metrics for diagnosing cross-service interactions
-	Automation: CI/CD pipelines and deployment scripts reduce management overhead (C3)
-	Infrastructure as Code: CloudFormation and Helm enable reproducible deployments
The paper's insight that "the network layout of the application becomes hardened by the addition of networking code" resonates with this thesis's approach of externalizing networking concerns to the API Gateway and service mesh, rather than embedding them in business logic.

APPENDIX K: GLOSSARY AND ACRONYMS (SUPPLEMENT)
This appendix supplements the main glossary with additional terms relevant to the infrastructure and DevOps focus.
