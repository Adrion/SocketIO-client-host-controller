'use strict';

// TODO Dynamic
var CANVAS_WIDTH = 1024;
var CANVAS_HEIGHT = 400;

function Player(id) {
  this.id = id;
  this.ready = false;
  this.counter = 0;
}

Player.prototype.increase = function() {
  this.counter++;
};

module.exports = Player;
