const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Reply doesn't exist");
    }

    const comment = result.rows[0];

    if (comment.owner !== owner) {
      throw new AuthorizationError("You can't access this reply");
    }
  }

  async deleteReplyById(threadId, commentId, replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE thread_id = $1 AND comment_id = $2 AND id = $3 RETURNING is_delete',
      values: [threadId, commentId, replyId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async addRepliesByCommentId(newReply, owner, thread_id, comment_id) {
    const { content } = newReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES ($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, owner, thread_id, comment_id],
    };

    const result = await this._pool.query(query);

    return new AddedReply({
      ...result.rows[0],
    });
  }
}

module.exports = ReplyRepositoryPostgres;
