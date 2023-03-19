const mapDBToModelDetailThread = (thread, comments, replies) => {
  const result = {
    id: thread.id,
    title: thread.title,
    body: thread.body,
    date: thread.date,
    username: thread.username,
    comments: comments.map((comment) => {
      if (comment.is_delete === false) {
        return {
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.content,
          replies: replies.flatMap((reply) => {
            if (reply.comment_id !== comment.id) {
              return [];
            }

            if (reply.is_delete === false) {
              return {
                id: reply.id,
                username: reply.username,
                date: reply.date,
                content: reply.content,
              };
            }
            return {
              id: reply.id,
              username: reply.username,
              date: reply.date,
              content: '**balasan telah dihapus**',
            };
          }),
        };
      } else {
        return {
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: '**komentar telah dihapus**',
        };
      }
    }),
  };

  return result;
};

module.exports = { mapDBToModelDetailThread };
