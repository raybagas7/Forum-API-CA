const CommentsTableHelper = require('../../../../tests/CommentsTableHelper');
const LikesTableHelper = require('../../../../tests/LikesTableHelper');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres.test', () => {
  const threadPayload = {
    id: 'thread-123',
    title: 'New Thread',
    body: 'This is a kind of thread',
    owner: 'user-123',
  };

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ username: 'test' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'netizen' });
    await ThreadsTableHelper.addThread(threadPayload);
    await CommentsTableHelper.addComment({ id: 'comment-123' });
    await CommentsTableHelper.addComment({ id: 'comment-456' });
    await LikesTableHelper.addLikeByUserIdAndCommentId({ id: 'like-123' });
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableHelper.cleanTable();
    await CommentsTableHelper.cleanTable();
    await LikesTableHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyLikeAvailability function', () => {
    it('should throw NotFoundError when multiple unique identifier is not exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '456';
      const likeRepository = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      await expect(likeRepository.verifyLikeAvailability('user-xxx', 'comment-xxx'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when miltiple unique identifier exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '456';
      const likeRepository = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      const currentLikeStatus = await likeRepository.verifyLikeAvailability('user-123', 'comment-123');
      await expect(likeRepository.verifyLikeAvailability('user-123', 'comment-123'))
        .resolves.not.toThrow(NotFoundError);
      expect(currentLikeStatus).toStrictEqual(true);
    });
  });

  describe('addNewLikeComment', () => {
    it('should error if user id not exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '456';
      const likeRepository = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      expect(likeRepository.addNewLikeComment('user-xxx', 'comment-123'))
        .rejects.toThrowError();
    });

    it('should error if comment id not exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '456';
      const likeRepository = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      expect(likeRepository.addNewLikeComment('user-123', 'comment-xxx'))
        .rejects.toThrowError();
    });

    it('should not error if user id and comment id exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '456';
      const likeRepository = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      expect(likeRepository.addNewLikeComment('user-456', 'comment-123'))
        .resolves.not.toThrowError();
    });
  });

  describe('toggleLikeCommentById', () => {
    it('should throw NotFoundError when multiple unique identifier is not exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '456';
      const likeRepository = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      expect(likeRepository.toggleLikeCommentById('user-xxx', 'comment-xxx', true))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when multiple unique identifier is exist and toggle the like into false', async () => {
      // Arrange
      const fakeIdGenerator = () => '456';
      const likeRepository = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      const currentLikeStatus = await likeRepository.verifyLikeAvailability('user-123', 'comment-123');
      const likeStatus = await likeRepository.toggleLikeCommentById('user-123', 'comment-123', currentLikeStatus);
      expect(likeStatus.is_like).toStrictEqual(false);
    });
  });
});
