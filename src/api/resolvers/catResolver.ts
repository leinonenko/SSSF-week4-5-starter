import {GraphQLError} from 'graphql';
import {Cat} from '../../interfaces/Cat';
import {locationInput} from '../../interfaces/Location';
import {UserIdWithToken} from '../../interfaces/User';
import rectangleBounds from '../../utils/rectangleBounds';
import catModel from '../models/catModel';
import {Query, Types} from 'mongoose';

// TODO: create resolvers based on cat.graphql
// note: when updating or deleting a cat, you need to check if the user is the owner of the cat
// note2: when updating or deleting a cat as admin, you need to check if the user is an admin by checking the role from the user object

export default {
  Query: {
    // cats
    cats: async () => {
      return await catModel.find();
    },
    // catById
    catById: async (_parent: unknown, args: Cat) => {
      return await catModel.findById(args.id);
    },
    // catsByOwner
    catsByOwner: async (_parent: unknown, args: Cat) => {
      return await catModel.find({owner: args.owner});
    },
    // catsByLocation
    catsByArea: async (_parent: unknown, args: locationInput) => {
      const bounds = rectangleBounds(args.topRight, args.bottomLeft);
      return await catModel.find({
        location: {
          $geoWithin: {
            $geometry: bounds,
          },
        },
      });
    },
  },
  Mutation: {
    // createCat
    createCat: async (_parent: unknown, args: Cat, user: UserIdWithToken) => {
      if (!user.id) {
        throw new GraphQLError('Not authorized');
      }
      args.owner = user.id as unknown as Types.ObjectId;
      const cat = new catModel(args);
      return await cat.save();
    },
    // updateCat
    updateCat: async (_parent: unknown, args: Cat, user: UserIdWithToken) => {
      if (!user.id) {
        throw new GraphQLError('Not authorized');
      }
      const cat = await catModel.findOneAndUpdate(
        {_id: args.id, owner: user.id},
        args,
        {new: true}
      );
      return cat;
    },
    // deleteCat
    deleteCat: async (_parent: unknown, args: Cat, user: UserIdWithToken) => {
      if (!user.id) {
        throw new GraphQLError('Not authorized');
      }
      const cat = await catModel.findOneAndDelete({
        _id: args.id,
        owner: user.id,
      });
      return cat;
    },
    // deleteCat as admin
    deleteCatAsAdmin: async (
      _parent: unknown,
      args: Cat,
      user: UserIdWithToken
    ) => {
      if (!user.id || user.role !== 'admin') {
        throw new GraphQLError('Not authorized');
      }
      const cat = await catModel.findByIdAndDelete(args.id);
      return cat;
    },
    // updateCat as admin
    updateCatAsAdmin: async (
      _parent: unknown,
      args: Cat,
      user: UserIdWithToken
    ) => {
      if (!user.id || user.role !== 'admin') {
        throw new GraphQLError('Not authorized');
      }
      const cat = await catModel.findByIdAndUpdate(args.id, args, {
        new: true,
      });
      return cat;
    },
  },
};
