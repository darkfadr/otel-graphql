require("dotenv").config();
const { initializeTracer } = require('../../tracer')
initializeTracer('astronauts', 'http://localhost:9411/api/v2/spans');

const { ApolloServer, gql } = require("apollo-server");
const { ApolloServerPluginInlineTrace } = require("apollo-server-core");
const { buildFederatedSchema } = require("@apollo/federation");
const { TRACE_PARENT_HEADER } = require("@opentelemetry/core");
const { TracingPlugin } = require("../../tracingPlugin");
const astronauts = require("./data");

const port = 4001;

const typeDefs = gql`
  type Astronaut @key(fields: "id") {
    id: ID!
    name: String
  }

  extend type Query {
    astronaut(id: ID!): Astronaut
    astronauts: [Astronaut]
  }
`;

const resolvers = {
  Astronaut: {
    __resolveReference(reference, context, info) {
      return astronauts.find(astronaut => astronaut.id === reference.id);
    }
  },
  Query: {
    astronaut: (root, { id }, context, info) => astronauts.find(astronaut => astronaut.id === id),
    astronauts: (root, args, context, info) => astronauts
  }
};


const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  context: ({ req }) => {
    console.log('👨🏿‍🚀 Astronaut: receiving ', req.headers[TRACE_PARENT_HEADER]);

    return {  }
  },
  plugins: [
    ApolloServerPluginInlineTrace(),
    TracingPlugin()
  ]
});

server.listen({ port }).then(({ url }) => {
  console.log(`Astronauts service ready at ${url}`);
});
