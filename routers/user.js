const express = require('express');
const router = new express.Router();
const User = require('../models/user');


router.post('/users/signup', async (req, res) => {
  try {
    //console.log(User);
    const user = new User({name: req.body.name, password: req.body.password, score: 0});
    console.log(user);
    await user.save();
    // const user2 = await User.find({name: user.name});
    // console.log(user2);
    res.status(201).send({user});
  } catch (e) {
    res.status(400).send();
  }
});

router.post('/users/login', async (req, res) => {
  try {

    const user = await User.findUser(req.body.name, req.body.password);
    //console.log(user);
    if(user.loggedIn)
      throw new Error();
    user.loggedIn = true;
    await user.save();
    //console.log(user);
    res.send(user);
  } catch (e) {
    res.status(404).send('unable to login');
  }
});

router.patch('/users/save/:name', async (req, res) => {
  try {
    //console.log(req.params.name)
     //console.log(req.body);
    const name = req.params.name;
    const updates = Object.keys(req.body); //key will return an array of strings
    const user = await User.findOne({name});
    // //console.log(user);
    // //console.log(updates);
    // console.log(req.body.x);
    // user.x = req.body.x;
    // user.y = req.body.y;
    updates.forEach((update) => { //update is a string
        user[update] = req.body[update]; //have to use bracket notation because update is a string
      });
    console.log(user);
    await user.save();

    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
})

router.patch('/users/logoutAll', async (req, res) => {
  console.log('logout');
  await User.logOutUsers();
})


module.exports = router;
