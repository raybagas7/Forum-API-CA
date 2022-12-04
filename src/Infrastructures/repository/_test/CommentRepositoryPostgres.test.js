const CommentsTableHelper = require('../../../../tests/CommentsTableHelper');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddedReply = require('../../../Domains/comments/entities/AddedReply');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const NewReply = require('../../../Domains/comments/entities/NewReply');
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

  describe('addComment function', () => {
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
      ).resolves.not.toThrow(NotFoundError);
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

  describe('checkCommentAvailability', () => {
    it('should throw NotFoundError if comment not exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        commentRepository.checkCommentAvailability('comment-123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if comment exist', async () => {
      // Arrange
      const fakeCommentId = 'comment-123';
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      await CommentsTableHelper.addComment({ id: fakeCommentId });

      // Action & Assert
      await expect(
        commentRepository.checkCommentAvailability(fakeCommentId)
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('addReplies function', () => {
    it('should perist new reply', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'This is the reply',
      });

      const fakeIdGenerator = () => '123';
      const fakeOwner = 'user-999';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await CommentsTableHelper.addComment({ id: fakeCommentId });
      await commentRepositoryPostgres.addRepliesByCommentId(
        newReply,
        fakeOwner,
        fakeThreadId,
        fakeCommentId
      );

      // Assert
      const reply = await CommentsTableHelper.findCommentById('comment-123');
      expect(reply).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'This is the reply',
      });

      const fakeIdGenerator = () => '123';
      const fakeOwner = 'user-999';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await CommentsTableHelper.addComment({ id: fakeCommentId });

      // Action
      const addedReply = await commentRepositoryPostgres.addRepliesByCommentId(
        newReply,
        fakeOwner,
        fakeThreadId,
        fakeCommentId
      );

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'This is the reply',
          owner: 'user-999',
        })
      );
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw NotFoundError if reply not exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const fakeOwner = 'user-123';
      const fakeReplyId = 'reply-999';
      await CommentsTableHelper.addComment({ id: 'comment-123' });
      await CommentsTableHelper.addRepliesByCommentId({ id: 'reply-123' });

      // Action & Assert
      await expect(
        commentRepository.verifyReplyOwner(fakeReplyId, fakeOwner)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if owner unauthorized to the reply', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const fakeOwner = 'user-123';
      const fakeReplyId = 'reply-123';
      await CommentsTableHelper.addComment({ id: 'comment-123' });
      await CommentsTableHelper.addRepliesByCommentId({ owner: 'user-999' });

      // Action & Assert
      await expect(
        commentRepository.verifyReplyOwner(fakeReplyId, fakeOwner)
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw InvariantError or AuthorizationError if reply exist and owner have an access', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const fakeOwner = 'user-123';
      const fakeReplyId = 'reply-123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      await CommentsTableHelper.addComment({ id: 'comment-123' });
      await CommentsTableHelper.addRepliesByCommentId({ owner: 'user-123' });

      // Action & Assert
      await expect(
        commentRepository.verifyReplyOwner(fakeReplyId, fakeOwner)
      ).resolves.not.toThrow(NotFoundError);
      await expect(
        commentRepository.verifyReplyOwner(fakeReplyId, fakeOwner)
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteReplyById', () => {
    it('should delete reply from database', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const fakeReplyId = 'reply-123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      await CommentsTableHelper.addComment({ id: fakeCommentId });
      await CommentsTableHelper.addRepliesByCommentId({ id: fakeReplyId });

      // Action & Assert
      const replyStatus = await commentRepository.deleteReplyById(
        fakeThreadId,
        fakeCommentId,
        fakeReplyId
      );
      expect(replyStatus.is_delete).toStrictEqual(true);
    });
  });
});
