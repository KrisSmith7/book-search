const {User} = require('../models')
const {signToken} = require('../utils/auth')
const {AuthenticationError} = require ('apollo-server-express')

const resolvers = {
    Query: {
        me: async(parent, args, context) => {
          if (context.user) {
            const userData = await User.findOne({_id:context.user._id})
            .select('-__v -password')
            .populate('savedBooks')

          return userData;
          }
          throw new AuthenticationError('You are not logged in.')
        }
    },

    Mutation:{
       // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
  addUser: async(parent, args) => {
    const user = await User.create(args);

    // if (!user) {
    //   console.log({ message: 'Something is wrong!' });
    // }
    const token = signToken(user);
    return { token, user };
  },
   
  // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
  // {body} is destructured req.body
  login: async (parent, {email, password }) => {
        const user = await User.findOne({email});
        if (!user) {
          throw new AuthenticationError("Can't find this user");
        }
    
        const correctPw = await user.isCorrectPassword({password});
    
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials!');
        }
        const token = signToken(user);
        return { token, user };
      },
  // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
  // user comes from `req.user` created in the auth middleware function
 saveBook: async (parent, {input}, context) => {
      if (context.user){
      const updatedUser = await User.findByIdandUpdate(
        { _id: context.user._id },
        { $push: { savedBooks: input } },
        {new: true}
      );
      return updatedUser;
      }
    throw new AuthenticationError('You must be logged in to save a book!')
    },
   
  // remove a book from `savedBooks`
  removeBook: async (parent, {bookId}, context ) => {
    if (context.user) {
       return User.findByIdAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId} } },
        { new: true }
      )
    }
    }
  }
}
  
  module.exports = resolvers;