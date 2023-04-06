const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyLikeAvailability(user_id, comment_id) {
    const query = {
      text: 'SELECT is_like FROM likes WHERE user_id = $1 AND comment_id = $2',
      values: [user_id, comment_id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Like not exist');
    }

    return result.rows[0].is_like;
  }

  async addNewLikeComment(user_id, comment_id) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes VALUES ($1, $2, $3)',
      values: [id, user_id, comment_id],
    };

    await this._pool.query(query);
  }

  async toggleLikeCommentById(user_id, comment_id, isLike) {
    const query = {
      text: 'UPDATE likes SET is_like = $1 WHERE user_id = $2 AND comment_id = $3 RETURNING is_like',
      values: [!isLike, user_id, comment_id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Like not exist');
    }

    return result.rows[0];
  }
}

module.exports = LikeRepositoryPostgres;
