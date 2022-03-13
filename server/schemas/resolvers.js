const {User} = require('../models')
const {signToken} = require('../utils/auth')
const {AuthenticationError} = require ('apollo-server-express')

const resolvers = {
    Query: {

        user: async(parent, {args}) => {
          return User.findOne({args}).populate('savedBooks')
        },

        users: async () => {
          return User.find({})
        },

        me: async(parent, args, context) => {
          if (context.user) {
            return User.findOne({_id:context.user._id}).populate('savedBooks');
          }
        }
    },

    Mutation:{
       // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
  addUser: async(parent, { username, email, password, error}) => {
    const user = await User.create({ username, email, password});

    if (!user) {
      console.log({ message: 'Something is wrong!' });
    }
    const token = signToken(user);
    return { token, user };
  },
   
  // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
  // {body} is destructured req.body
  login: async (parent, { username, email, password }) => {
        const user = await User.findOne({ $or: [{ username: username }, { email: email }] });
        if (!user) {
          throw new AuthenticationError("Can't find this user");
        }
    
        const correctPw = await user.isCorrectPassword(body.password);
    
        if (!correctPw) {
          throw new AuthenticationError('Incorrect password!');
        }
        const token = signToken(user);
        return { token, user };
      },
  // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
  // user comes from `req.user` created in the auth middleware function
 saveBook: async (parent, args, context) => {
      if (context.user){
      return User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: args } },
      );
      }},
   
  // remove a book from `savedBooks`
  removeBook: async (parent, {bookId}, context ) => {
    if (context.user) {
       return User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId} } },
        { new: true }
      )
    }
    }
  }
}
  
  module.exports = resolvers;