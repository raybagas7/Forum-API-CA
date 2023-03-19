const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment, owner, thread_id) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES ($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, thread_id],
    };

    const result = await this._pool.query(query);

    return new AddedComment({
      ...result.rows[0],
    });
  }

  async getCommentByThreadId(id) {
    const queryComments = {
      text: `SELECT comments.*, users.username
      FROM comments
      LEFT JOIN users ON comments.owner = users.id
      WHERE thread_id = $1`,
      values: [id],
    };

    const resultComments = await this._pool.query(queryComments);

    return resultComments.rows;
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Comment doesn't exist");
    }

    const comment = result.rows[0];

    if (comment.owner !== owner) {
      throw new AuthorizationError("You can't access this comment");
    }
  }

  async deleteCommentById(threadId, commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE thread_id = $1 AND id = $2 RETURNING is_delete',
      values: [threadId, commentId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async checkCommentAvailability(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Comment doesn't exist");
    }
  }
}

module.exports = CommentRepositoryPostgres;
