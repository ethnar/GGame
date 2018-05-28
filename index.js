global.program = require('commander');
program
    .version('0.1.0')
    .option('-r, --reset', 'Reset the world')
    .option('-d, --dev', 'Development mode')
    .option('-s, --ssl', 'Connect over ssl')
    .parse(process.argv);

require('./static');
const utils = require('./singletons/utils');
const express = require('express');
const worldBuilder = require('./singletons/world-builder');
const World = require('./class/world');
const server = require('./singletons/server');
const resurrect = require('resurrect-js');

const necro = new resurrect();

const initialise = program.reset;
let worldPromise;

if (initialise) {
    utils.log('** Creating a new world **');
    worldPromise = worldBuilder.buildNewWorld();
    worldPromise.then(world => {
        world.save('initial_save.json');
        world.save('rolling_save.json');
    });
} else {
    worldPromise = Promise.resolve(World.load('rolling_save.json'));
}

worldPromise.then(world => {
    global.world = world;

    utils.log('*** Start ***');

    let terminate = false;

    setInterval(() => {
        world.cycle();
        server.updatePlayers();
        if (terminate) {
            utils.log('*** Terminated ***');
            process.exit(0);
        }
    }, program.dev ? 100 : 1000);

    process.on('SIGTERM', function () {
        terminate = true;
    });
});