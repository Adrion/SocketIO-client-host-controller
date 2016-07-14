//TODO Dynamic
CANVAS_WIDTH = 400;
CANVAS_HEIGHT = 400;

function Player(id){
  this.id            = id;
  this.smoothingLR   = new Array();
  this.smoothingFB   = new Array();
  this.smoothedLR    = 0;
  this.smoothedFB    = 0;

  this.colors = ['#FF0000','#FFFF00','#FF00FF','#00FF00','#00FFFF','#0000FF'];
  this.states = ['circle','square'];
  
  this.x = CANVAS_WIDTH/(Math.random()*5);
  this.y = CANVAS_HEIGHT/(Math.random()*5);
  this.width = 100;
  this.height = 100;
  this.color = this.colors[Math.floor(Math.random()*this.colors.length)];
  this.state = this.states[Math.floor(Math.random()*this.states.length)];

  this.update();
}

Player.prototype.update = function(){
  //Stay within Bounds
  if(this.x < 0){
    this.x = 0;
  }else if(this.x > CANVAS_WIDTH-this.width){
    this.x = CANVAS_WIDTH-this.width;
  }

  if(this.y < 0){
    this.y = 0;
  }else if(this.y > CANVAS_HEIGHT-this.height){
    this.y = CANVAS_HEIGHT-this.height;
  }
};

Player.prototype.move = function(tiltLR, tiltFB){
  if((tiltLR < 2) && (tiltLR > -2)){  tiltLR = 0;  }
  if((tiltFB < 2) && (tiltFB > -2)){  tiltFB = 0;  }

  if(this.smoothingLR.length >= 5){ this.smoothingLR.pop(); }
  if(this.smoothingFB.length >= 5){ this.smoothingFB.pop(); }
  this.smoothingLR.push(tiltLR);
  this.smoothingFB.push(tiltFB);
  this.smoothedLR = 0;
  this.smoothedFB = 0;

  for(var i = 0; i < this.smoothingLR.length; i++){
    this.smoothedLR += this.smoothingLR[i];
  }
  for(var i = 0; i < this.smoothingFB.length; i++){
    this.smoothedFB += this.smoothingFB[i];
  }

  this.smoothedLR /= this.smoothingLR.length;
  this.smoothedFB /= this.smoothingFB.length;

  var speed = this.smoothedLR;

  //if tilting right, increase left, else, decrease
  if((this.smoothedLR > 3) || (this.smoothedLR < -3)){
    this.x += speed/2;
  }

  speed = this.smoothedFB;
  //if tilting right, increase left, else, decrease
  if((this.smoothedFB > 3) || (this.smoothedFB <-3)){
    this.y -= speed;
  }

  this.update();
};

module.exports = Player;
