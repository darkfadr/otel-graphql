require("dotenv").config();
const { initializeTracer } = require("./tracer")

initializeTracer('supergraph', 'http://localhost:9411/api/v2/spans');

const { ApolloGateway } = require("@apollo/gateway");
const { ApolloServer } = require("apollo-server");
const { ApolloServerPluginInlineTrace } = require("apollo-server-core");

const port = 4000;
const gateway = new ApolloGateway({
  serviceList: [
    { name: "astronauts", url: "http://localhost:4001/graphql" },
    { name: "missions", url: "http://localhost:4002/graphql" },
    { name: "locations", url: "http://localhost:4003/graphql" }
  ]
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
  plugins: [
    ApolloServerPluginInlineTrace(),
  ]
});

server.listen({ port }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
