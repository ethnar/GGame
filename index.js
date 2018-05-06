require('./static');
const express = require('express');
const worldBuilder = require('./singletons/world-builder');
const server = require('./singletons/server');

global.world = worldBuilder.buildNewWorld();

console.log('*** Start ***');

setInterval(() => {
    world.cycle();
    server.updatePlayers();
}, 10);
