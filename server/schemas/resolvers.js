const { User, Book} = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require ('apollo-server-express');

const resolvers = {
  Query: {
      me: async (parent, args, context) => {
          if(context.user) {
              const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
            return userData;
          }
          throw new AuthenticationError('You\'re not logged in');
      }
  },

  Mutation: {
      login: async(parent, {email, password }) => {
          const user = await User.findOne({ email });
          if (!user) {
              throw new AuthenticationError('Incorrect Info');
          }
          const correctPassword = await user.isCorrectPassword(password);
          if (!correctPassword) {
              throw new AuthenticationError('Incorrect Info');
          }
          const token = signToken(user);
          return { token, user };
      },

      addUser: async (parent, args) => {
          const user = await User.create(args);
          const token = signToken(user);
          return { token, user };
      },

      saveBook: async (parent, { input }, context) => {
          if (context.user) {
              const updatedUser = await User.findByIdAndUpdate(
                  { _id: context.user._id },
                  { $addToSet: { savedBooks: input } },
                  { new: true }
              );
              return updatedUser;
          }
          throw new AuthenticationError("Please log in")
      },

      removeBook: async (parent, args, context) => {
          if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                  { _id: context.user._id },
                  { $pull: { savedBooks: { bookId: args.bookId } } },
                  { new: true }
                );
                return updatedUser;
          }
          throw new AuthenticationError("Please log in")
      }
    }
};

module.exports = resolvers;

