const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5
  },
  y: {
    type: Number,
    default: 50
  },
  x: {
    type: Number,
    default: 50
  },
  loggedIn: {
    type: Boolean,
    default: false
  },
  hp: {
    type: Number,
    default: 100
  },
  score: {
    type: Number,
    defualt: 1,
  }
})

userSchema.statics.findUser = async (name, password) =>
{
  //console.log(name)
  const user = await User.findOne({name});

  //console.log(user);

  if(!user)
  {
    //console.log('bad');
    throw new Error('no user exists');
  }
  // console.log(password, user);
  const isMatch = await bcrypt.compare(password, user.password);
   //console.log(isMatch);
   if(!isMatch)
  {

    throw new Error('Unbale to login');
  }

   return user;
}

userSchema.statics.logOutUsers = async () => {
  await User.updateMany({loggedIn: true}, {loggedIn: false})
}

userSchema.pre('save', async function(next) { //this is middleware, hashed the password before it is saves
  const user = this;


  //isModified tells us what has changed
  if(user.isModified('password'))
  {
    user.password = await bcrypt.hash(user.password, 8)
  }

  //console.log(user)

  next(); //tells us that the code running before we save the user is done
});

const User = mongoose.model('Users', userSchema);


module.exports = User;
