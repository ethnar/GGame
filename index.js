const express = require('express');
const worldBuilder = require('./utils/world-builder');

const world = worldBuilder.buildNewWorld();

console.log('*** Start ***');

world.run();
