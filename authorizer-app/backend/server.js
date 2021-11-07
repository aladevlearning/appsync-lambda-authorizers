const fastify = require('fastify')({logger: true})
const fs = require('fs');
const jwt = require('jsonwebtoken');

fastify.register(require('fastify-cors'), {
    origin: (origin, cb) => {
        if(/localhost/.test(origin)){
            //  Request from localhost will pass
            cb(null, true)
            return
        }
        // Generate an error on other origins, disabling access
        cb(new Error("Not allowed"))
    },
    methods: ['GET', 'PUT', 'POST']
})

// Declare a route
fastify.get('/generate-token', async (request, reply) => {

    const privateKey = fs.readFileSync('keys/private.pem');
    const token = jwt.sign({foo: 'bar'}, privateKey, {algorithm: 'RS256'});

    return {token}
})

// Run the server!
const start = async () => {
    try {
        await fastify.listen(3001)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()
