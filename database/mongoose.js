const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true, //index's are created
  useFindAndModify: false,
}, () => {
  console.log('connected to databse')
});
