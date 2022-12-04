/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableHelper = {
  async addComment({
    id = 'comment-123',
    content = 'This thread is about a new thread',
    owner = 'user-123',
    thread_id = 'thread-123',
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4)',
      values: [id, content, owner, thread_id],
    };

    await pool.query(query);
  },

  async addRepliesByCommentId({
    id = 'reply-123',
    content = 'This thread is about a new thread',
    owner = 'user-123',
    thread_id = 'thread-123',
    comment_id = 'comment-123',
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5)',
      values: [id, content, owner, thread_id, comment_id],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
    await pool.query('DELETE FROM replies WHERE 1=1');
  },

  async deleteCommentById(threadId, commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE thread_id = $1 AND id = $2 RETURNING is_delete',
      values: [threadId, commentId],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
};

module.exports = CommentsTableHelper;
