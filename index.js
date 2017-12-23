const express = require('express');
const worldBuilder = require('./utils/world-builder');

global.world = worldBuilder.buildNewWorld();

console.log('*** Start ***');

world.run();
