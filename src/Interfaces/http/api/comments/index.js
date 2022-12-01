const CommentHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'comments',
  register: async (server, { container }) => {
    const commentsHandler = new CommentHandler(container);
    server.route(routes(commentsHandler));
  },
};
