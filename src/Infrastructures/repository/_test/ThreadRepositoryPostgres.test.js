const CommentsTableHelper = require('../../../../tests/CommentsTableHelper');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ username: 'test' });
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
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

  describe('getDetailThread', () => {
    it('should throw NotFoundError if thread not exist', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      await ThreadsTableHelper.addThread({ id: fakeThreadId, title: 'test' });
      const fakeIdGenerator = () => '123'; // STUB
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      expect(
        threadRepositoryPostgres.getDetailThread('xxx')
      ).rejects.toThrowError(NotFoundError);
    });

    it('should get thread from database', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      await ThreadsTableHelper.addThread({ id: fakeThreadId, title: 'test' });
      await CommentsTableHelper.addComment({ id: 'comment-123' });
      await CommentsTableHelper.addComment({ id: 'comment-321' });
      await CommentsTableHelper.deleteCommentById(fakeThreadId, 'comment-321');
      const fakeIdGenerator = () => '123'; // STUB
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action &  Assert
      const getDetailThread = await threadRepositoryPostgres.getDetailThread(
        fakeThreadId
      );
      expect(getDetailThread.id).toBe(fakeThreadId);
      expect(getDetailThread.comments).toHaveLength(2);
    });
  });
});
