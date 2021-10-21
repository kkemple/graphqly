const { gql } = require("apollo-server-express");

exports.typeDefs = gql`
  type Query {
    me: User
  }

  type User {
    email: String
    name: String!
    projects: [Project!]!
    repos: [Repo!]!
  }

  type Project {
    id: ID!
    name: String!
    branchName: String!
    schemaPath: String!
    repo: Repo!
  }

  type Repo {
    id: ID!
    name: String!
    url: String!
  }
`;

const LIST_REPOS = gql`
  query ListRepos {
    viewer {
      repositories(last: 100) {
        nodes {
          id
          name
          url
        }
      }
    }
  }
`;

exports.resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      return user;
    },
  },
  User: {
    projects: async (_, __, { user, prisma }) => {
      return prisma.project.findMany({
        where: { userId: user.id },
      });
    },
    repos: async (_, __, { github }) => {
      const data = await github.request(LIST_REPOS);
      return data.viewer.repositories.nodes;
    },
  },
  Project: {
    repo: async (project, _, { user }) => {
      // TODO: fetch repo by project.repoId
      return null;
    },
  },
};
