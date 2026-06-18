# EventBus.Messages — do/don't

## Do

- Extend `BaseIntegrationEvent` for every new integration event class; it provides `CorrelationId` (for distributed tracing) and `CreationDate` automatically.
- Add new queue-name constants to `EventBusConstant.cs`; reference the constant in both the publisher and the consumer to avoid magic strings.
- Version breaking changes by adding a new event class (e.g., `BasketCheckoutEventV2`) rather than modifying the existing class; producers and consumers share this compile-time contract.
- Keep event classes as plain POCOs with no business logic; their sole purpose is to carry data across service boundaries.
- Treat `EventBus.Messages` as a shared API boundary — communicate with all teams that consume the library before adding or renaming fields.

## Don't

- Do not add package references to `EventBus.Messages.csproj`; the project is intentionally a zero-dependency POCO library.
- Do not rename or remove fields from existing event classes without a coordinated, versioned migration; any change is a breaking change for all consumers.
- Do not embed logic, constructors with side effects, or validation inside event classes; serialization/deserialization by MassTransit requires default constructors and writable properties.
- Do not define queue names inline in service code; always use the constants from `EventBusConstant.cs`.
- Do not add event classes that are used by only one service internally — this library is for cross-service contracts only; internal events belong in the service's own domain layer.

@AGENT.md
