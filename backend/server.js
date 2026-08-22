const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/postgres'), {
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:password123@db:5432/appdb'
});


fastify.get('/health', async (request, reply) => {
  try {
    const client = await fastify.pg.connect();
    const { rows } = await client.query('SELECT NOW() as db_time, 1 as status');
    client.release();

    return {
      status: 'healthy',
      database: 'connected',
      timestamp: rows[0].db_time
    };
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message
    });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();