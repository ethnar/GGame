global.program = require('commander');
program
    .version('0.1.0')
    .option('-r, --reset', 'Reset the world')
    .option('-d, --dev', 'Development mode')
    .parse(process.argv);

require('./static');
const express = require('express');
const worldBuilder = require('./singletons/world-builder');
const World = require('./class/world');
const server = require('./singletons/server');
const resurrect = require('resurrect-js');

const necro = new resurrect();

const initialise = program.reset;

if (initialise) {
    console.log('** Creating a new world **');
    global.world = worldBuilder.buildNewWorld();
    global.world.save('initial_save.json');
    global.world.save('rolling_save.json');
}

global.world = World.load('rolling_save.json');

console.log('*** Start ***');

setInterval(() => {
    world.cycle();
    server.updatePlayers();
}, program.dev ? 100 : 1000);
