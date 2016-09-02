'use strict';

function Player(id) {
  this.id = id;
  this.ready = false;
  this.counter = 0;
}

Player.prototype.increase = function() {
  this.counter++;
};

module.exports = Player;
