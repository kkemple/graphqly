const { PrismaClient } = require("@prisma/client");
const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const http = require("http");
const axios = require("axios");
const cors = require("cors");
const querystring = require("querystring");
const jwt = require("jsonwebtoken");

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
const prisma = new PrismaClient();
const app = express();
const httpServer = http.createServer(app);

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.text());

app.post("/auth", (req, res) => {
  axios
    .post("https://github.com/login/oauth/access_token", {
      client_id: process.env.GITHUB_APP_ID,
      client_secret: process.env.GITHUB_APP_SECRET,
      code: req.body,
    })
    .then(({ data }) => {
      const { access_token } = querystring.parse(data);
      return axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      });
    })
    .then(async ({ data }) => {
      const user = await prisma.user.findUnique({
        where: { githubId: data.id },
      });
      return (
        user ||
        prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            githubId: data.id,
          },
        })
      );
    })
    .then((user) => {
      const token = jwt.sign(user, process.env.JWT_SECRET);
      res.send(token);
    });
});

async function startApolloServer() {
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
