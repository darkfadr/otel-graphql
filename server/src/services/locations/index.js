require("dotenv").config();
const { initializeTracer } = require('../../tracer');
initializeTracer('locations', 'http://localhost:9411/api/v2/spans');
// initializeTracer('locations', 'https://1f1e0fefdd79.ngrok.io/api/v2/spans');

const { ApolloServer, gql } = require("apollo-server");
const { ApolloServerPluginInlineTrace } = require("apollo-server-core");
const { buildFederatedSchema } = require("@apollo/federation");
const { TRACE_PARENT_HEADER } = require("@opentelemetry/core");
const otel = require('@opentelemetry/api');
const rickandmorty = require('rickmortyapi');
const faker = require('faker');
const { TracingPlugin } = require("../../tracingPlugin");

const port = 4003;

const typeDefs = gql`
  type Location {
    id: ID!
    name: String
    type: String!
    dimension: String
    missions: [Mission]
  }

  extend type Mission @key(fields: "id") {
    id: ID! @external
    location: Location
  }

  extend type Query {
    location(id: ID!): Location
    locations: [Location]
  }
`;

const num = () => faker.datatype.number({ min: 1, max: 8 });
const resolvers = {
  Location: {
    missions: () => [num(), num()]
        .map(id => ({ __typename: "Mission", id }))
  },
  Mission: {
    location: () => rickandmorty.getLocation(num())
  },
  Query: {
    location: () => rickandmorty.getLocation(num()),
    missions: () => rickandmorty.getLocation()
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  context: ({ req, res }) => {
    console.log('🌍 Location: receiving ', req.headers[TRACE_PARENT_HEADER]);
    otel.propagation.extract(req.headers[TRACE_PARENT_HEADER])

    return {};
  },
  plugins: [
    ApolloServerPluginInlineTrace(),
    TracingPlugin()
  ]
});

server.listen({ port }).then(({ url }) => {
  console.log(`Locations service ready at ${url}`);
});
