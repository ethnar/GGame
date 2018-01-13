const express = require('express');
const worldBuilder = require('./singletons/world-builder');
const server = require('./singletons/server');

global.world = worldBuilder.buildNewWorld();

console.log('*** Start ***');

world.run();
