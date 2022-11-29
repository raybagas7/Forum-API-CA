const ThreadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'thread',
  register: async (server, { container }) => {
    const threadsHandler = new ThreadsHandler(container);
    server.route(routes(threadsHandler));
  },
};
