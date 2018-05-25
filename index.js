global.program = require('commander');
program
    .version('0.1.0')
    .option('-r, --reset', 'Reset the world')
    .option('-d, --dev', 'Development mode')
    .option('-s, --ssl', 'Connect over ssl')
    .parse(process.argv);

require('./static');
const express = require('express');
const worldBuilder = require('./singletons/world-builder');
const World = require('./class/world');
const server = require('./singletons/server');
const utils = require('./singletons/utils');
const resurrect = require('resurrect-js');

const necro = new resurrect();

const initialise = program.reset;

if (initialise) {
    utils.log('** Creating a new world **');
    global.world = worldBuilder.buildNewWorld();
    global.world.save('initial_save.json');
    global.world.save('rolling_save.json');
}

global.world = World.load('rolling_save.json');

utils.log('*** Start ***');

let terminate = false;

setInterval(() => {
    world.cycle();
    server.updatePlayers();
    if (terminate) {
        utils.log('*** Terminated ***');
        process.exit(0);
    }
}, program.dev ? 10 : 1000);

process.on('SIGTERM', function () {
    terminate = true;
});
