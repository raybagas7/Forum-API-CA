const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread, owner) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({
      ...result.rows[0],
    });
  }

  async checkThreadAvailability(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Thread doesn't exist");
    }
  }

  async getDetailThread(id) {
    const queryThread = {
      text: `SELECT threads.*, users.username
      FROM threads 
      LEFT JOIN users
      ON threads.owner = users.id
      WHERE threads.id = $1`,
      values: [id],
    };

    const resultThread = await this._pool.query(queryThread);

    if (!resultThread.rowCount) {
      throw new NotFoundError("Thread doesn't exist");
    }

    return resultThread.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
