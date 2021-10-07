import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import fetch from "isomorphic-fetch";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL + "/graphql",
  fetch,
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(process.env.NEXT_PUBLIC_TOKEN_KEY);
  if (token) {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return forward(operation);
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});
