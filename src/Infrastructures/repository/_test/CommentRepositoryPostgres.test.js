const CommentsTableHelper = require('../../../../tests/CommentsTableHelper');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  const threadPayload = {
    id: 'thread-123',
    title: 'New Thread',
    body: 'This is a kind of thread',
    owner: 'user-123',
  };

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ username: 'test' });
    await UsersTableTestHelper.addUser({ id: 'user-999', username: 'netizen' });
    await ThreadsTableHelper.addThread(threadPayload);
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableHelper.cleanTable();
    await CommentsTableHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should perist new comment', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'This thread is about a new thread',
      });

      const fakeIdGenerator = () => '123';
      const fakeOwner = 'user-999';
      const fakeThreadId = 'thread-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepositoryPostgres.addComment(
        newComment,
        fakeOwner,
        fakeThreadId
      );

      // Assert
      const comment = await CommentsTableHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'This thread is about a new thread',
      });

      const fakeIdGenerator = () => '123';
      const fakeOwner = 'user-999';
      const fakeThreadId = 'thread-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        newComment,
        fakeOwner,
        fakeThreadId
      );

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'This thread is about a new thread',
          owner: 'user-999',
        })
      );
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw NotFoundError if comment not exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const fakeCommentId = 'comment-999';
      const fakeOwner = 'user-123';
      await CommentsTableHelper.addComment({ content: 'Test Comment' });
      // Action & Assert
      await expect(
        commentRepository.verifyCommentOwner(fakeCommentId, fakeOwner)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if owner unauthorized to the comment', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const fakeCommentId = 'comment-123';
      const fakeOwner = 'user-999';
      await CommentsTableHelper.addComment({ content: 'Test Comment' });

      // Action & Assert
      await expect(
        commentRepository.verifyCommentOwner(fakeCommentId, fakeOwner)
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw InvariantError or AuthorizationError if comment exist and owner have an access', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const fakeCommentId = 'comment-123';
      const fakeOwner = 'user-123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      await CommentsTableHelper.addComment({ content: 'Test Comment' });

      // Action & Assert
      await expect(
        commentRepository.verifyCommentOwner(fakeCommentId, fakeOwner)
      ).resolves.not.toThrow(InvariantError);
      await expect(
        commentRepository.verifyCommentOwner(fakeCommentId, fakeOwner)
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteCommentById', () => {
    it('should delete comment from database', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const fakeCommentId = 'comment-123';
      const fakeThreadId = 'thread-123';
      await CommentsTableHelper.addComment({ content: 'Test Comment' });

      // Action & Assert
      const commentStatus = await commentRepository.deleteCommentById(
        fakeThreadId,
        fakeCommentId
      );
      expect(commentStatus.is_delete).toStrictEqual(true);
    });
  });
});
