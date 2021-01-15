


const Hapi = require('@hapi/hapi');
const CatboxRedis = require('@hapi/catbox-redis');

const start = async () => {

    const server = Hapi.server();

    const add = async (a, b) => {

        await Hoek.wait(3000);   // Simulate some slow I/O

        return Number(a) + Number(b);
    };

    const sumCache = server.cache({
        cache: 'my_cache',
        expiresIn: 10 * 1000,
        segment: 'customSegment',
        generateFunc: async (id) => {

            return await add(id.a, id.b);
        },
        generateTimeout: 2000
    });

    server.route({
        path: '/add/{a}/{b}',
        method: 'GET',
        handler: async function (request, h) {

            const { a, b } = request.params;
            const id = `${a}:${b}`;

            return await sumCache.get({ id, a, b });
        }
    });

    await server.start();

    console.log('Server running at:', server.info.uri);
};

start();