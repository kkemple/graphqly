const { PrismaClient } = require("@prisma/client");
const express = require("express");
const { ApolloServer, AuthenticationError } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const http = require("http");
const cors = require("cors");
const axios = require("axios");
const querystring = require("querystring");
const jwt = require("jsonwebtoken");
const { GraphQLClient } = require("graphql-request");
const { typeDefs, resolvers } = require("./schema");

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
    .then(async ({ data }) => {
      const { access_token } = querystring.parse(data);
      const response = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      });
      return [response, access_token];
    })
    .then(async ([{ data }, githubAccessToken]) => {
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
            githubAccessToken,
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
    context: async ({ req }) => {
      try {
        const [, token] = req.headers.authorization.match(/^bearer (\S+)$/i);
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id } });

        const github = new GraphQLClient("https://api.github.com/graphql", {
          headers: {
            authorization: `Bearer ${user.githubAccessToken}`,
          },
        });

        return {
          prisma,
          user,
          github,
        };
      } catch (error) {
        console.log(error);
        throw new AuthenticationError("Invalid token");
      }
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
