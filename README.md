# OpenTelemetry Integration for Apollo Federation

This project demonstrates an approach to integrating [OpenTelemetry](https://opentelemetry.io/) with a GraphQL API powered by Apollo Federation.

## Installation & Set-up

Run the following command to build the GraphQL and Zipkin containers:

```sh
docker-compose up
```

GraphQL Playground will be available at [http://localhost:4000/graphql](http://localhost:4000/graphql) and the Zipkin UI will be available at [http://localhost:9411/zipkin](http://localhost:9411/zipkin).
## References

- Opentelemetry Federation Integration by @mandiwise

Background reading and related links:
- [Federated trace protocol buffer source](https://github.com/mdg-private/monorepo/blob/main/proto/src/reports.proto)
- [Apollo Tracing documentation](https://github.com/apollographql/apollo-tracing)
- [OpenTelemetry API for JavaScript](https://open-telemetry.github.io/opentelemetry-js/index.html)
- [Overview OpenTelemetry GraphQL Instrumentation Example](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/examples/graphql)
