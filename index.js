'use strict';

const Hapi = require('@hapi/hapi');
const { json } = require('body-parser');
const utilities = require('./utility');


const init = async () => {

    const server = Hapi.server({
        port: 3001,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return { defs : "test"};
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
    console.log(utilities.get("mot"));
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();


