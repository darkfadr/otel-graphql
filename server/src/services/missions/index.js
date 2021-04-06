require("dotenv").config();
const { initializeTracer } = require('../../tracer');
initializeTracer('missions', 'http://localhost:9411/api/v2/spans');

const { ApolloServer, gql } = require("apollo-server");
const { ApolloServerPluginInlineTrace } = require("apollo-server-core");
const { buildFederatedSchema } = require("@apollo/federation");
const { TRACE_PARENT_HEADER } = require("@opentelemetry/core");
const { TracingPlugin } = require("../../tracingPlugin");
const missions = require("./data");

const port = 4002;

const typeDefs = gql`
  type Mission @key(fields: "id") {
    id: ID!
    crew: [Astronaut]
    designation: String!
    startDate: String
    endDate: String
  }

  extend type Astronaut @key(fields: "id") {
    id: ID! @external
    missions: [Mission]
  }

  extend type Query {
    mission(id: ID!): Mission
    missions: [Mission]
  }
`;

const resolvers = {
  Astronaut: {
    missions: (astronaut) => missions.filter(({ crew }) => crew.includes(astronaut.id))
  },
  Mission: {
    __resolveReference: ({ id }) => missions.find(mission => mission.id === id),
    crew: (mission) => mission.crew.map(id => ({ __typename: "Astronaut", id }))
  },
  Query: {
    mission: (_, { id }) => missions.find(mission => mission.id === id),
    missions: () => missions
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  context: ({ req }) => {
    console.log('📡 Mission: receiving ', req.headers[TRACE_PARENT_HEADER]);
    return {};
  },
  plugins: [
    ApolloServerPluginInlineTrace(),
    TracingPlugin()
  ]
});

server.listen({ port }).then(({ url }) => {
  console.log(`Missions service ready at ${url}`);
});
