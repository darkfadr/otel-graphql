# OpenTelemetry Integration for Apollo Federation

This project demonstrates an approach to integrating [OpenTelemetry](https://opentelemetry.io/) with a GraphQL API powered by Apollo Federation. It leverages the query plan traces that are already collected by Apollo and parses those trace nodes into a tree of OpenTelemetry spans. The tracer in this demo is configured to use the [Zipkin](https://zipkin.io/) and console exporters.

## Installation & Set-up

Begin by creating a new graph in [Apollo Studio](https://studio.apollographql.com/).

Next, add an `.env` file in the `server` directory using the `.env.sample` template and add your new Apollo key to it:

```text
APOLLO_KEY=YOUR_APOLLO_KEY_HERE
APOLLO_GRAPH_VARIANT=development
NODE_ENV=development
SERVICE_NAME=graphql_api
ZIPKIN_URL=http://zipkin:9411/api/v2/spans
```

Run the following command to build the GraphQL and Zipkin containers:

```sh
docker-compose up
```

GraphQL Playground will be available at [http://localhost:4000/graphql](http://localhost:4000/graphql) and the Zipkin UI will be available at [http://localhost:9411/zipkin](http://localhost:9411/zipkin).

You will also need to enable managed federation by pushing the implementing services' schemas to Apollo Studio before querying your graph:

```sh
apollo service:push --key=YOUR_APOLLO_KEY_HERE --serviceName=astronauts --serviceURL=http://localhost:4001 --variant=development --endpoint=http://localhost:4001
```

```sh
apollo service:push --key=YOUR_APOLLO_KEY_HERE --serviceName=missions --serviceURL=http://localhost:4002 --variant=development --endpoint=http://localhost:4002
```

## Usage & Rationale

Once the GraphQL and Zipkin containers are running and managed federation has been configured, you can query the GraphQL API and view traces from those requests in both Apollo Studio and Zipkin.

Once the tracer is initialized at the gateway level, a single Apollo Server plugin running in the gateway is all that's needed to forward appropriately structured trace data to your OpenTelemetry exporter of choice (this example uses the console and Zipkin exporters).

Rather than explicitly instrumenting the gateway and implementing services' APIs to capture OpenTelementry traces, this demo instead leverages the data already collected in Apollo's federated traces and parses the nodes into OpenTelemetry-compliant spans. By taking this approach, we get the best of both worlds—we can continue to forward traces to Apollo Studio in order to take advantage of its full capabilities as an observability tool, and we can also view federated traces within the broader context of spans that represent the full lifecycle of a request (e.g. including client-generated spans) using OpenTelemetry tools.

## TODO

- [ ] Adjust for potential clock skew between services
- [ ] Finish adding all relevant errors to spans
- [ ] Disambiguate implementing services from gateway in Zipkin UI
- [ ] Add Apollo Client example to demonstrate full request trace
- [ ] Sample traces (and investigate other performance enhancements)

## References

Background reading and related links:

- [Federated trace protocol buffer source](https://github.com/mdg-private/monorepo/blob/main/proto/src/reports.proto)
- [Apollo Tracing documentation](https://github.com/apollographql/apollo-tracing)
- [OpenTelemetry API for JavaScript](https://open-telemetry.github.io/opentelemetry-js/index.html)
- [Overview OpenTelemetry GraphQL Instrumentation Example](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/master/examples/graphql)
