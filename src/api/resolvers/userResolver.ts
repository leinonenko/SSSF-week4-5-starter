import {GraphQLError} from 'graphql';
import {Cat} from '../../interfaces/Cat';
import LoginMessageResponse from '../../interfaces/LoginMessageResponse';
import {User, UserIdWithToken} from '../../interfaces/User';
// TODO: create resolvers based on user.graphql
// note: when updating or deleting a user don't send id to the auth server, it will get it from the token
// note2: when updating or deleting a user as admin, you need to check if the user is an admin by checking the role from the user object

export default {
  Cat: {
    owner: async (parent: Cat) => {
      const response = await fetch(
        `${process.env.AUTH_URL}/users/${parent.owner}`
      );
      if (!response.ok) {
        throw new GraphQLError('Error fetching user');
      }
      const user: User = await response.json();
      return user;
    },
  },
  Query: {
    // create user
    users: async () => {
      const response = await fetch(`${process.env.AUTH_URL}/users`);
      if (!response.ok) {
        throw new GraphQLError('Error fetching users');
      }
      const users: User[] = await response.json();
      return users;
    },
    // userById
    userById: async (_: any, {id}: {id: string}) => {
      const response = await fetch(`${process.env.AUTH_URL}/users/${id}`);
      if (!response.ok) {
        throw new GraphQLError('Error fetching user');
      }
      const user: User = await response.json();
      return user;
    },
    // checkToken
    checkToken: async (
      _parent: unknown,
      _args: unknown,
      user: UserIdWithToken
    ) => {
      const response = await fetch(`${process.env.AUTH_URL}/token`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new GraphQLError('Error fetching user');
      }
      const userFromAuth = await response.json();
      return userFromAuth;
    },
  },
};
