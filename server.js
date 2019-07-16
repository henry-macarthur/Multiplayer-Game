const express = require('express');
const request = require('request');
const app = express();
var needle = require('needle');
//46363672
//f44b5cbe6c13c8c66b1f5a907b4ee4fa60e5a8b9


//const server = require('http').createServer(app)
const fetch = require('node-fetch');
const socket = require('socket.io');
var http = require('http');

const port = process.env.PORT || 2000;
const userRouter = require('./routers/user');
require('./database/mongoose');

//onsole.log(io);

app.use(express.static('public'));
app.use(express.json());
app.use(userRouter);

let SOCKET_LIST = {};
let ID_MAP = {};
var initPack = {player: [], bullet: []};
var removePack = {player: [], bullet:[]};
let COLORS = ["#BB8FCE", "#3498DB", "#D35400", "#CB4335", "#0E6655", "#D4AC0D", "#C39BD3", "#E74C3C", "#9C640C"];
let LOCATIONS = [{x: 30, y: 30, i: 0}, {x: 350, y: 350, i: 0}, {x: 470, y: 100, i: 0}, {x: 700, y: 50, i:1}, {x: 700, y: 250, i: 0}, {x: 100, y: 360, i: 0}, {x: 620, y: 430, i: 1}, {x: 200, y: 250, i: 1}]; //6
//let PLAYERS = {};

// var rand () = > {
//   let m
// }

class Powerup
{
  constructor(type)
  {
    this.color;
    switch(type)
    {
      case 'shotgun':
      {
        this.color = 'red';
        this.x = 700;
        this.y = 50;
        break;
      }
      case 'rapid':
      {
        this.color = 'blue';
        this.x = 620;
        this.y = 430;
        break;
      }
      case 'damage':
      {
        this.color = 'green'
        this.x = 200;
        this.y = 250;
        break;
      }
    }
    //let location = LOCATIONS[Math.floor(Math.random()*5)];
    this.visible = true;
    this.type = type;
    this.time;
    this.i;
  }

  updateLocation(x, y)
  {
    this.x = x;
    this.y = y;
  }

  getDistance(x, y)
  {
    return Math.sqrt(Math.pow(x -this.x, 2) + Math.pow(y - this.y, 2));
  }

  update()
  {
    for(var i in Player.list)
    {
      //console.log(this.getDistance(Player.list[i].x, Player.list[i].y))
      if(this.getDistance(Player.list[i].x+ 12, Player.list[i].y + 12) < 25 && Player.list[i].powerup === 'none')
      {
        Player.list[i].powerup = this.type;
        Player.list[i].powerupTime = Date.now();
        this.visible = false;
        this.time = Date.now();
      //
        var ii = Math.floor(Math.random() * 7);
        let location = LOCATIONS[ii];
        let count = 0;
        while(location.i == 1 && count < 7)
        {
          console.log(count)
          ii = Math.floor(Math.random() * 7)
          location = LOCATIONS[ii];
          count ++;
        }
        LOCATIONS[ii].i = 1;

        for(let i = 0; i < LOCATIONS.length; i++)
        {
          if(LOCATIONS[i].x == this.x && LOCATIONS[i].y == this.y)
          {
            console.log('update')
            LOCATIONS[i].i == 0;
          }
        }

        this.updateLocation(location.x, location.y);
      //  delete LOCATIONS[location.i];
      }

      if(!this.visible && ((Date.now() - this.time) >= 2000))
      {
        console.log('respawn')
        this.visible = true;
      }
    }
  }

  getUpdatePack()
  {
    return {
      x: this.x,
      y: this.y,
      color: this.color,
      visible: this.visible
    }
  }


}

Powerup.list = [new Powerup('shotgun'), new Powerup('rapid'), new Powerup('damage')];

Powerup.update = function()
{
  var package = [];
  for(var i in Powerup.list)
  {
    let powerup = Powerup.list[i];
    // player.x++;
    // player.y++;
    powerup.update();
    //console.log(socket.color);
    package.push(powerup.getUpdatePack());
  }

  return package;
}


var createEntity = function(x, y) {
  var self = {
    x: x,
    y: y,
    spdX: 0,
    spdY: 0,
    id: '',
    color: 'black',
    mult: 1
  }

  self.update = function() {
    self.updatePosition();
  }

  self.updatePosition = function () {
    self.x += (self.spdX * self.mult);
    self.y += (self.spdY * self.mult);
  }

  self.getDistance = function(pt) {
    return Math.sqrt(Math.pow(self.x-pt.x, 2) + Math.pow(self.y - pt.y, 2));
  }

  return self
}
var Player = function (id, x, y, hp, score, name)
{
  var data = createEntity(x, y);
  data.id = id;
  data.color = COLORS[Math.floor(Math.random() * 9)];
  data.up = false,
  data.down = false,
  data.left = false,
  data.name = name,
  data.right = false,
  data.attack = false,
  data.mouseAngle = 0;
  data.spd = 8;
  data.canShoot = true;
  data.lastShot = 0;
  data.reloadTime = 200;
  data.powerup = 'none';
  data.powerupTime;
  data.addDmg = 0;
  //console.log(hp);
  data.hp = hp;
  data.fullhp = 100;
  data.score = score;


  data.update = function() {
    data.updatePosition();

    for(let i = 0; i < Wall.list.length; i++)
    {

      if(Wall.list[i].collide(data.x, data.y).collide)
      {
        if(data.up === true)
          data.y += 8;
        if(data.down === true)
          data.y -= 8;
        if(data.left === true)
          data.x += 8;
        if(data.right === true)
          data.x -= 8;
      }
    }

    if(data.powerup != 'none')
    {
    //  console.log(Date.now() - data.powerupTime)

      switch (data.powerup)
      {
        case 'shotgun':
        {
          data.reloadTime = 250;
          break;
        }
        case 'damage':
        {
          data.addDmg = 15
          data.reloadTime = 450;
          //console.log('damage')
          break;
        }
        case 'rapid':
        {
          data.reloadTime = 80;
          break;
        }
      }

      if((Date.now() - data.powerupTime) > 7000)
      {
      //  console.log('ok')
        data.powerup = 'none';
        data.reloadTime = 200;
        data.addDmg = 0;
      }
    }

    if(data.canShoot === false && (Date.now() - data.lastShot) > data.reloadTime)
      data.canShoot = true;
    if(data.attack && data.canShoot)
    {
      console.log(data.powerup)
      if(data.powerup === 'shotgun')
      {
        data.shootBullet(data.mouseAngle);
        data.shootBullet(data.mouseAngle+15);
        data.shootBullet(data.mouseAngle-15);
      }
      else
        data.shootBullet(data.mouseAngle);

        //console.log(data.mouseAngle);
      for(var i in SOCKET_LIST)
      {
        let s = SOCKET_LIST[i];
        s.emit('init', {
          player: Player.getSignIn(),
          bullet: Bullet.getSignIn()
        })
      }

      data.canShoot = false;
      data.lastShot = Date.now();
    }
  }

  data.shootBullet = function (angle) {
    var b = Bullet(data, angle)
    //console.log(angle);

    b.x = data.x;
    b.y = data.y;
  }

  data.updatePosition = function()
  {
    if(data.right)
      data.x += data.spd;
    if(data.left)
      data.x -= data.spd;
    if(data.up)
      data.y -= data.spd;
    if(data.down)
      data.y += data.spd;
  }

  data.getInitPack = function ()
  {
    return {
      id: data.id,
      x: data.x,
      y: data.y,
      hp: data.hp,
      hpMax: data.fullhp,
      score: data.score,
      color: data.color,
      name: name
    }
  }

  data.getUpdatePack = function ()
  {
    return {
      id: data.id,
      x: data.x,
      score: data.score,
      hp: data.hp,
      y: data.y,
      name: name
    }
  }
  Player.list[id] = data;
  initPack.player.push(data.getInitPack());
  //console.log(initPack);
  return data;
}

Player.list = {};

Player.onConnect = function(socket, x, y, hp, score, name)
{
  //console.log(score)
  var currentPlayer = Player(socket.id, x, y, hp, score, name);
  socket.on('keyPress', (data) => {
    //console.log('dsadf')
    if(data.input === 'left')
      currentPlayer.left = data.state;
    else if(data.input === 'right')
      currentPlayer.right = data.state;
    else if(data.input === 'up')
      currentPlayer.up = data.state;
    else if(data.input === 'down')
      currentPlayer.down = data.state;
    else if(data.input == 'shoot')
      currentPlayer.attack = data.state;
    else if(data.input === 'mouseAngle')
    {
      let angle = Math.atan2(currentPlayer.y - data.state.y, currentPlayer.x - data.state.x) * 180 / Math.PI;
      // console.log(currentPlayer.x + ' ' + currentPlayer.y);
      // console.log(data.state.x + ' ' + data.state.y);
      //console.log(angle);
      //console.log(currentPlayer.y - data.state.y + ' ' + currentPlayer.x - data.state.x);
      currentPlayer.mouseAngle = angle;
      //console.log(currentPlayer.mouseAngle);
    }
  });

for(var i in SOCKET_LIST)
{
  let s = SOCKET_LIST[i];
  s.emit('init', {
    player: Player.getSignIn(),
    bullet: Bullet.getSignIn()
  })
}
}

Player.getSignIn = function() {
  var players = [];
  for(var i in Player.list)
  {
    players.push(Player.list[i].getInitPack())
  }

  return players;

}

Player.onDisconnect = function(socket) {
  console.log(Player.list)
  delete Player.list[socket.id];
  removePack.player.push(socket.id);

}

Player.update = function()
{
  var package = [];
  for(var i in Player.list)
  {
    let player = Player.list[i];
    // player.x++;
    // player.y++;
    player.update();
    //console.log(socket.color);
    package.push(player.getUpdatePack());
  }

  return package;
}

var Bullet = function(parent, angle)
{


//  console.log(this.angle)
  var self = createEntity(parent.x, parent.y);
  self.angle = angle;
  self.id = Math.random();
  self.parent = parent;
  self.spd = 20;
  self.spdX = -Math.cos(self.angle/180*Math.PI) * 20;
  self.spdY = -Math.sin(self.angle/180*Math.PI) * 20;
  self.dmg = 5;
  self.timer = 0;
  self.remove = false;
  var super_update = self.update;

  self.updateAngle = function (data)
  {
    // if(self.angle > 0)
    //   self.angle += 90;
    //console.log(self.angle);
    //if(self.y > selfdd)
    //self.spdX *= -1;

    for(let i = 0; i < 4; i++)
    {
      let b = false;
      switch(i)
      {
        case 0:
        {
          self.spdX *= -1;
          // console.log(data);
          // console.log(Wall.list[data.i])
          //let c =
          //console.log((3* Math.sign(self.spdX)));
          //console.log(self.spdX)
          if(!Wall.list[data.i].collide(self.x + (20* Math.sign(self.spdX)), self.y + (15* Math.sign(self.spdY))).collide)
          {
            // console.log(data)
            // console.log(self.x + self.spdX, self.y + self.spdY)
            b = true;
            //console.log(self.spdY)
          }
          else {
            self.spdX *= -1;
          }
          break;
        }
        case 1:
        {
          self.spdY *= -1;
          //self.spdX *= -1
          let xx = self.spdX /20;
          let yy = self.spdy /20
          if(!checkCollide(!Wall.list[data.i].collide(self.x + (10* Math.sign(self.spdX)), self.y + (10* Math.sign(self.spdY))).collide))
          {
            b = true;
          }
          else {
            self.spdY *= -1;
            //self.spdX *= -1;
          }
          break;
        }
        case 2:
        {
          self.spdY *= -1;
          self.spdX *= -1
          if(!checkCollide(!Wall.list[data.i].collide(self.x + (10* Math.sign(self.spdX)), self.y + (10* Math.sign(self.spdY))).collide))
          {
            b = true;
          }
          else {
            self.spdY *= -1;
            self.spdX *= -1;
          }
          break;
        }
        case 3:
        {
          break;
        }
      }

      if(b)
        i = 6;
    }



    //console.log(self.angle);
    // console.log(self.angle)
    // if(self.angle >= 0)
    //   self.angle *= -1;
    // else if(self.angle < 0 && self.angle >= -90)
    //   self.angle += 90;
    // else
    //   self.angle *= -1;//+= 90

    //self.angle *= -1;//+= angle;
    //self.updateSpd();
    // self.x += self.spdX;
    // self.y += self.spdY;
    // console.log(self.angle);
    //console.log(se)
    //console.log(self.angle);
  }
  self.update = function () {
    if(self.timer++ > 15)
    {
      self.remove = true;
    }
    super_update();

    for(var i in Player.list)
    {
      var p = Player.list[i];
      //hit and its hitting a different player
      //console.log(p.addDmg)
      if(self.getDistance(p) < 30 && self.parent.id !== p.id)
      {
          var shooter = Player.list[self.parent.id]
        p.hp -= (self.dmg + self.parent.addDmg + self.parent.score);


        if(p.hp <= 0)
        {
          if(shooter)
          {
            shooter.score += 1;
          }

          p.hp = p.fullhp;
          p.x = 50;
          p.y = 50;
          p.score = 0
        }
        self.remove = true;
      }
    }
  }

  self.updateSpd = function()
  {
    self.spdX = -Math.cos(self.angle/180*Math.PI) * 20;
    self.spdY = -Math.sin(self.angle/180*Math.PI) * 20;
  }

  self.getInitPack = function ()
  {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
    }
  }

  self.getUpdatePack = function ()
  {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
    }
  }

  Bullet.list[self.id] = self;
  //console.log(self.x + ' ' + self.y);
  initPack.bullet.push(self.getInitPack());

  return self;
}

Bullet.getSignIn = function ()
{
  var bullets = [];
  for(var i in Bullet.list)
  {
    bullets.push(Bullet.list[i].getInitPack())
  }


  return bullets;
}

Bullet.list = {};

Bullet.update = function()
{
  var package = [];
  for(var i in Bullet.list)
  {
    let bullet = Bullet.list[i];

    for(let i = 0; i < Wall.list.length; i++)
    {
      if(Wall.list[i].collide(bullet.x, bullet.y).collide)
      {
        bullet.updateAngle(Wall.list[i].collide(bullet.x, bullet.y));
        //console.log(bullet.angle);
        //bullet.angle += 90;
      //  bullet.updateSpd();


        //console.log(bullet.angle)
      }
    }
    if(bullet.remove)
    {
      //console.log('delete')
      delete Bullet.list[i];
      removePack.bullet.push({
        id: bullet.id,
      });
    }
    bullet.update();

    //console.log(socket.color);
    package.push(bullet.getUpdatePack());


  }

  return package;
}
//server.listen(port);


var server = app.listen(port, () => {
  needle.patch(`http://localhost:${port}/users/logoutAll`);//'https://henry-online-game.herokuapp.com/users/logoutAll');//
  console.log('Server is running on port ' + port);
});

var io = socket(server);

io.on('connection', function(socket) {
  console.log('user connected!', socket.id)

  socket.on('join',function (data){
      socket.id = Math.random();//data._id;
      socket.name = data.name;
      data = JSON.parse(data);
      //console.log(data);
      let name = data.name;
      //initializeSession();
      // socket.x = 50;
      // socket.y = 50;
      // socket.color = COLORS[Math.floor(Math.random() * 9)];
      ////var currentPlayer = Player(socket.id, data.x, data.y);
      //console.log(Wall.list);
      socket.emit('walls', Wall.list);
      socket.emit('powerups', Powerup.update());
      SOCKET_LIST[socket.id] = socket;
      ID_MAP[socket.id] = data._id;
      Player.onConnect(socket, data.x, data.y, data.hp, data.score, data.name)
      //PLAYERS[socket.id] = currentPlayer;
      //SOCKET_LIST[data._id]
      //console.log(SOCKET_LIST.length);
      //socket.emit

      socket.on('disconnect', function() {

        var update = {
          x: Player.list[socket.id].x,
          y: Player.list[socket.id].y,
          score: Player.list[socket.id].score,
          hp: Player.list[socket.id].hp,
          loggedIn: false
        }
        //console.log('dis')
        Player.onDisconnect(socket)
        //console.log(update);
        //https://henry-online-game.herokuapp.com/
        //`http://localhost:${port}/users/save/${name}`
        //http://localhost:${port}/users/save/${name}
        //`https://henry-online-game.herokuapp.com/users/save/${name}`
        //`http://localhost:${port}/users/save/${name}`
        needle.patch(`http://localhost:${port}/users/save/${name}`, update, {json: true}, function(err, resp) {

        });

        for(var i in SOCKET_LIST)
        { //emit pack to each socket;
          //console.log(i);
          let socket = SOCKET_LIST[i];
          // if(removePack.player.length !== 0)
          //  console.log(removePack)
          socket.emit('remove', removePack);
        }
        removePack.player = [];
        removePack.bullet = [];

        //instead i think i need to make a socket.io call to do this on the front end

        delete ID_MAP[socket.id];
        delete SOCKET_LIST[socket.id];




      });
    })
  });


setInterval(function() {
  var package = {
    player: Player.update(),
    bullet: Bullet.update(),
  }

  //console.log(package)
 //
 //console.log(SOCKET_LIST)
 //  if(package.player.length !== 0)
 //  {
 //    //console.log(initPack.player.length)
 //   console.log(package);
 // }


  for(var i in SOCKET_LIST)
  { //emit pack to each socket;
    //console.log(i);
    let socket = SOCKET_LIST[i];
    socket.emit('update', package)
    //socket.emit('init', initPack)
    // if(removePack.player.length !== 0)
    //  console.log(removePack)
    socket.emit('updatePowerUp', Powerup.update());
    socket.emit('remove', removePack);
  }
  initPack.player = [];
  initPack.bullet = [];
  removePack.player = [];
  removePack.bullet = [];

}, 40)


// io.on('connection', function(socket) {
//   console.log('a user connected');
// })
// serve the homepage
app.get('/', (req, res) => {
  res.sendFile('/Users/henrymacarthur/Desktop/Projects/Game/public/index.html');
});


/////////////
class Wall
{
  constructor(x, y, w, h, i)
  {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.i = i;
  }

  collide(x, y)
  {

    if( (x + 20 >= this.x && x + 20 <= this.x + this.w && y >= this.y && y <= this.y + this.h)
      || (x  >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h)
      || (x + 20 >= this.x && x + 20 <= this.x + this.w && y + 20 >= this.y && y +20 <= this.y + this.h)
      || (x >= this.x && x <= this.x + this.w && y +20 >= this.y && y + 20<= this.y + this.h)){      // console.log(x + ' ' + y)
      // console.log(this);
      //console.log(y+20 + ' ' + this.y)
      return {collide: true, x: this.x, y: this.y, w: this.w, h: this.h, i: this.i};
    }
    return {collide: false};
  }
}

checkCollide =  function(x1, y1, w, h, x, y)
{
  //console.log(x1, y1, w, h, x, y)
  if( (x + 20 >= x1 && x + 20 <= x1 + w && y >= y1 && y <= y1 + h)
    || (x  >= x1 && x <= x1 + w && y >= y1 && y <= y1 + h)
    || (x + 20 >= x1 && x + 20 <= x1 + w && y + 20 >= y1 && y +20 <= y1 + h)
    || (x >= x1 && x <= x1 + w && y +20 >= y1 && y + 20<= y1 + h)){
      return true;
    }

    return false;
}

Wall.list = [new Wall(100, 0, 30, 300, 0), new Wall(300, 150, 200, 30, 1), new Wall(100, 300, 200, 30, 2),
new Wall(100, 400, 200, 30, 3), new Wall(280, 100, 30, 200, 4), new Wall(200, 50, 30, 200, 5), new Wall(600, 100, 30, 300, 6),
new Wall(750, 100, 30, 300, 7), new Wall(675, 400, 30, 100, 8), new Wall(400, 400, 150, 30, 9),
new Wall(500, 0, 30, 100, 10), new Wall(620, 300, 60, 30, 11), new Wall(680, 200, 70, 30, 12), new Wall(-18, 0, 20, 800, 13),
new Wall(0, -20, 900, 20, 14), new Wall(0, 500, 800, 20, 15), new Wall(800, 0, 20, 500, 16)];
