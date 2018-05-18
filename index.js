require('./static');
const express = require('express');
const worldBuilder = require('./singletons/world-builder');
const World = require('./class/world');
const server = require('./singletons/server');
const resurrect = require('resurrect-js');
const fs = require('fs');

const necro = new resurrect();

global.world = worldBuilder.buildNewWorld();
// global.world = World.load('save.data');

console.log('*** Start ***');

setInterval(() => {
    world.cycle();
    server.updatePlayers();
}, 100);
