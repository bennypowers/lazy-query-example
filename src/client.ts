import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';

import { locationVar } from './router';

const uri =
  'https://api.spacex.land/graphql';

export const link = new HttpLink({ uri });

const cache =
  new InMemoryCache({
    typePolicies: {
      Launch: {
        fields: {
          launch_date_utc(str) {
            return str ? new Date(str) : null;
          },
        },
      },
      Query: {
        fields: {
          location(): Location {
            return locationVar();
          },
        },
      },
    },
  });

export const client =
  new ApolloClient({ cache, link });
