const mapDBToModelDetailThread = (thread, comments) => {
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
