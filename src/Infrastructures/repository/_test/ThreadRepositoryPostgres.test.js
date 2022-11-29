const ThreadsTableHelper = require('../../../../tests/ThreadsTableHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should perist new thread', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'New Thread',
        body: 'This is a kind of thread',
      });

      const fakeIdGenerator = () => '123';
      const fakeOwner = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await threadRepositoryPostgres.addThread(newThread, fakeOwner);

      // Assert
      const thread = await ThreadsTableHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'New Thread',
        body: 'This is a kind of thread',
      });

      const fakeIdGenerator = () => '123'; // STUB
      const fakeOwner = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(
        newThread,
        fakeOwner
      );

      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'New Thread',
          owner: 'user-123',
        })
      );
    });
  });
});
