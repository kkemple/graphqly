const { PrismaClient } = require("@prisma/client");
const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const http = require("http");

const typeDefs = gql`
  type Query {
    me: User
  }

  type User {
    email: String!
    name: String!
    projects: [Project!]!
  }

  type Project {
    id: ID!
    name: String!
    repoUrl: String!
    branchName: String!
    schemaPath: String!
  }
`;

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      return user;
    },
  },
  User: {
    projects: async (_, __, { user, prisma }) => {
      return prisma.projects.findWhere({ userId: user.id });
    },
  },
};

const port = process.env.PORT || 4000;

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const prisma = new PrismaClient();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async (req) => {
      // verify req.headers.authorization
      // get user related to JWT
      const user = await prisma.user.findUnique({ where: { id: 1 } });
      return {
        prisma,
        user,
      };
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  server.applyMiddleware({ app });
  await new Promise((resolve) => httpServer.listen({ port }, resolve));
  console.log(
    `Server is now running on http://localhost:${port}${server.graphqlPath}`
  );
}

startApolloServer();
