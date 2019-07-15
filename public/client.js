//console.log('running client');
var socket = io.connect('https://henry-online-game.herokuapp.com/');//'localhost:2000');//
//'http://localhost:2000')
//////////LOGIN USER

//console.log('afaf')


//
 //console.log(sD);
//var apiKey = "46363672";
//var sessionId = "2_MX40NjM2MzY3Mn5-MTU2Mjg4MTk3MDc3NH5aQnNWcTA4SS95VkZlbTdjNElyL1lTWTV-fg";
//var token = 'T1==cGFydG5lcl9pZD00NjM2MzY3MiZzaWc9YTljNDU0NzRlNzQzZTIyYzdhYmY3YzU1NzA4YjdkNmI5NGU5MTA3NjpzZXNzaW9uX2lkPTJfTVg0ME5qTTJNelkzTW41LU1UVTJNamc0TVRrM01EYzNOSDVhUW5OV2NUQTRTUzk1VmtabGJUZGpORWx5TDFsVFdUVi1mZyZjcmVhdGVfdGltZT0xNTYyODgxOTk5Jm5vbmNlPTAuOTgzOTE1MzUyMjYzMTU5MiZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNTYyODg1NTk5JmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9';
  //console.log('ok')
//initializeSession();
// Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

function initializeSession() {
  var session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', function(event) {
  session.subscribe(event.stream, 'subscriber', {

      width: '0%',
      height: '0%',

    }, handleError);
  });
  // Create a publisher
  var publisher = OT.initPublisher('publisher', {

    width: '0%',
    height: '0%',

  }, handleError);

  publisher.publishVideo(false);

  // Connect to the session
  session.connect(token, function(error) {
    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else {
      session.publish(publisher, handleError);
    }
  });
}
//https://game-with-voicechat.herokuapp.com/

const button = document.getElementById('myButton');
button.addEventListener('click', function(e) {
  e.preventDefault();
  let name = document.getElementById('myText').value;
  let password = document.getElementById('myPwd').value;

  const data = {
    'name': name,
    'password': password,
  }

  //console.log(data);

  fetch('/users/signup', {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then((res) => {
    if(res.status === 400)
      alert('user already exists, pick a new name')
    else{

    }
    //console.log(res);
  })
  //return false;
    //.then(res => console.log(res));

});

var signDiv = document.getElementById('signInDiv');
var gameDiv = document.getElementById('gameDiv');

const loginButton = document.getElementById('loginbutton');
loginButton.addEventListener('click', function(e) {
  e.preventDefault();
  let name = document.getElementById('myText').value;
  let password = document.getElementById('myPwd').value;

  const data = {
    name,
    password
  }

  fetch('/users/login', {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then((res) => {
    //console.log(gameDiv)
    //console.log('login');
    //console.log('asdf')
    if(res.status === 404)
    {
      alert('invalid login')
      throw new Error();
      //break;
    }

    return res.text();
  }).then((data) => {

      signDiv.style.display = 'none';
      gameDiv.style.display = 'inline-block';
    //  console.log(gameDiv);
    //https://dashboard.heroku.com/apps/game-with-voicechat

    //  initializeSession();
      console.log('inits')
      var SERVER_BASE_URL = 'https://game-with-voicechat.herokuapp.com/';
      fetch(SERVER_BASE_URL + '/session', {method: 'GET'}).then(function(res) {
        //console.log(res)
        return res.json()
      }).then(function(res) {
        apiKey = res.apiKey;
        sessionId = res.sessionId;
        token = res.token;
      //  console.log(apiKey + ' ' + sessionId + ' ' + token);
        //initializeSession();
      }).catch(handleError);
      //console.log('afafa')
      socket.emit('join', data);
      return false
  }).catch((e) => {
    //console.log(e)
  })
  //return false;
})


/////////canvas
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');
ctx.canvas.width = 800;
//ctx.canvas.background = "white"
//ctx.fillStyle = "black";
//ctx.fillRect(0, 0, canvas.width, canvas.height);



/////////socket

class Powerup
{
  constructor(x, y, color)
  {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  draw()
  {
    if(this.visible)
    {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, 20, 20);
    }
  }
}
Powerup.list = [];
var Player = function(pack)
{
  var self = {};
  self.id = pack.id;
  self.x = pack.x;
  self.y = pack.y;
  self.hp = pack.hp;
  self.hpMax = pack.hpMax;
  self.color = pack.color;
  self.score = pack.score;
  Player.list[self.id] = self;

  self.draw = function () {
    ctx.fillStyle = "#2ECC71";
    //console.log(self.hpMax);
    var hpWidth = 25 * (self.hp / self.hpMax);
    //console.log(hpWidth);
    ctx.fillRect(self.x, self.y - 10, hpWidth, 5);
    ctx.fillStyle = self.color;
    ctx.fillRect(self.x, self.y, 25, 25);
    ctx.fillStyle = 'white';
    ctx.fillText(self.score, self.x + 10, self.y+ 15, 20, 20);
  }
  return self;
}

Player.list = {};

var Bullet = function(pack)
{
  var self = {};
  self.id = pack.id;
  self.x = pack.x;
  self.y = pack.y;

  self.draw = function()
  {
    //console.log('dsaf')
      ctx.fillStyle = "black";//Bullet.list[i].color;
      ctx.fillRect(self.x, self.y, 10, 10);
  }
  Bullet.list[self.id] = self;

  return self;
}


Bullet.list = {};

class Wall
{
  constructor(x, y, w, h)
  {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  draw()
  {
    ctx.fillStyle = '#1A5276';
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

Wall.list = [];

socket.on('walls', function(data) {
  //console.log(data);
  for(let i = 0; i <data.length; i++)
  {
    Wall.list.push(new Wall(data[i].x, data[i].y, data[i].w, data[i].h));
  }
});

socket.on('powerups', function(data) {
//  console.log(data);
  for(let i = 0; i < data.length; i++)
  {
    Powerup.list.push(new Powerup(data[i].x, data[i].y, data[i].color));
  }
});

socket.on('updatePowerUp', function(data) {
  for(let i = 0; i < data.length; i++)
  {
    Powerup.list[i].x = data[i].x;
    Powerup.list[i].y = data[i].y;
    Powerup.list[i].visible = data[i].visible;
  }
})

let SCORE = [];
let SCORE_MAP = {};
//console.log(SCORE)

socket.on('init', function(data) {
  //console.log('adsfs')
  SCORE = [];
  //console.log(data)
  if(data.player.length !== 0)
  {
    //console.log(data);
  }
  for(let i = 0; i < data.player.length; i++)
  {
    SCORE_MAP[data.player[i].score] = data.player[i].name;
    SCORE.push(data.player[i].score)
    new Player(data.player[i]);
  }

  for(let i = 0; i < data.bullet.length; i++)
  {
    new Bullet(data.bullet[i]);
  }
  SCORE.sort(function(a, b) {return b-a;})
  for(let i = 0; i < SCORE.length; i++) {
    let s = SCORE[i];
    SCORE[i] = SCORE_MAP[SCORE[i]]
    document.getElementById(`${i}`).innerHTML = `${SCORE[i]}: ${s}`;
  }

  //console.log(SCORE)
});

socket.on('update', function(data) {

  for(let i = 0; i < data.player.length; i++)
  {
    // if(data.player.length !== 0)
    //   console.log(data.player);

    var package = data.player[i];
    var p = Player.list[package.id];
    if(p)
    {
      if(package.x !== undefined)
        p.x = package.x;
      if(package.y !== undefined)
        p.y = package.y;
      if(package.hp !== undefined)
        p.hp = package.hp;
      if(package.score !== undefined)
        p.score = package.score;
    }
  }

  for(let i = 0; i < data.bullet.length; i++)
  {
    var package = data.bullet[i];
    var p = Bullet.list[package.id];
    if(p)
    {
      if(package.x !== undefined)
        p.x = package.x;
      if(package.y !== undefined)
        p.y = package.y;
    }
  }
});

socket.on('remove', function(data) {
  if(data.player.length !== 0)
  {
    // console.log(data.player);
    // console.log(Player.list);
    // delete Player.list[data.player[i];
    // console.log(Player.list);

  }
  for(let i = 0; i < data.player.length; i++)
  {
    delete Player.list[data.player[i]];
  }

  for(let i = 0; i < data.bullet.length; i++)
  {
    delete Bullet.list[data.bullet[i].id];
  }
})

  var sD = document.getElementById('scoreBoard');
  for(let i = 0; i < 25; i++)
  {
    var d1 = document.createElement('div');
    //d1.innerHTML = "some text";
    d1.style.fontSize = "small"
    d1.id = `${i}`;
    d1.className = "ScoreElement"
    //d1.color = 'blue';
    sD.appendChild(d1)
  }
//var scoreB = document.getElementById("scoreBoard");
//var ctx2 = scoreB.getContext('2d');
//let ctx2 = scoreBoard.getContext('2d');


setInterval(function () {
  // if(Player.list.length !== 0)
  //   console.log(Player.list);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for(var i in Player.list)
  {
    Player.list[i].draw();
  }

  for(var i in Bullet.list)
  {
    Bullet.list[i].draw();
  }

  for(var i in Wall.list)
  {
    Wall.list[i].draw();
  }

  for(var i in Powerup.list)
  {
    Powerup.list[i].draw();
  }




  // ctx2.clearRect(0, 0, scoreB.width, scoreB.height);
  // ctx2.fillStyle = 'black';
  // ctx2.font = "15px Verdana";
  // ctx2.fillText('something', 40, 150);
}, 40)

// socket.on('updatedPositions', (data) => {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//
//
// })


///KEY PRESS
document.onkeydown = function(event)
{

  if(event.keyCode === 68)
  {
    //console.log(event.keyCode)
    socket.emit('keyPress', {input: 'right', state: true})
  }
  if(event.keyCode === 83)
    socket.emit('keyPress', {input: 'down', state: true})
  if(event.keyCode === 65)
    socket.emit('keyPress', {input: 'left', state: true})
  if(event.keyCode === 87)
    socket.emit('keyPress', {input: 'up', state: true})
}

document.onkeyup = function(event)
{
  if(event.keyCode === 68)
    socket.emit('keyPress', {input: 'right', state: false})
  if(event.keyCode === 83)
    socket.emit('keyPress', {input: 'down', state: false})
  if(event.keyCode === 65)
    socket.emit('keyPress', {input: 'left', state: false})
  if(event.keyCode === 87)
    socket.emit('keyPress', {input: 'up', state: false})
}

document.onmousedown = function(event) {
  //console.log('shoot')
  socket.emit('keyPress', {input: 'shoot', state: true})
}

document.onmouseup = function(event) {
  socket.emit('keyPress', {input: 'shoot', state: false})
}

document.onmousemove = function(event) {
  //var x = event.clientX;
  //var y = event.clientY;
  //console.log(event.clientX + ' ' + event.clientY);
  var x = event.clientX - 8;//-250 + event.clientX - 8 + 221
  var y = event.clientY - 87;//-250 + event.clientY - 8 + 7;
  //console.log(x + ' ' + y);
  //var angle = Math.atan2(y,x) / Math.PI * 180;
  //console.log(angle);
  socket.emit('keyPress', {input: 'mouseAngle', state: {x, y}})
}
/////////////
