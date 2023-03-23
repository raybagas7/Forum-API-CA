const CommentsTableHelper = require('../../../../tests/CommentsTableHelper');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const RepliesTableHelper = require('../../../../tests/RepliesTableHelper');

describe('ReplyRepositoryPostgres', () => {
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
    await RepliesTableHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
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
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await CommentsTableHelper.addComment({ id: fakeCommentId });
      await replyRepositoryPostgres.addRepliesByCommentId(
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

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await CommentsTableHelper.addComment({ id: fakeCommentId });

      // Action
      const addedReply = await replyRepositoryPostgres.addRepliesByCommentId(
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

  describe('getReplyByThreadId', () => {
    it('should return empty array if comment have no replies', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      await CommentsTableHelper.addComment({ id: 'comment-123' });

      //Action & Assert
      const getReplies = await replyRepository.getReplyByThreadId('thread-123');
      expect(getReplies).toHaveLength(0);
      expect(getReplies).toStrictEqual([]);
    });
    it('should return all replies from the thread comment', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await CommentsTableHelper.addComment({ id: 'comment-123' });
      await RepliesTableHelper.addRepliesByCommentId({ id: 'reply-123' });
      await RepliesTableHelper.addRepliesByCommentId({ id: 'reply-456' });

      const getReplies = await replyRepository.getReplyByThreadId('thread-123');
      expect(getReplies).toHaveLength(2);
      expect(
        getReplies[0].id === 'reply-123' || getReplies[0].id === 'reply-456'
      ).toBeTruthy();
      expect(
        getReplies[1].id === 'reply-123' || getReplies[1].id === 'reply-456'
      ).toBeTruthy();
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw NotFoundError if reply not exist', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const fakeOwner = 'user-123';
      const fakeReplyId = 'reply-999';
      await CommentsTableHelper.addComment({ id: 'comment-123' });
      await CommentsTableHelper.addRepliesByCommentId({ id: 'reply-123' });

      // Action & Assert
      await expect(
        replyRepository.verifyReplyOwner(fakeReplyId, fakeOwner)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if owner unauthorized to the reply', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const fakeOwner = 'user-123';
      const fakeReplyId = 'reply-123';
      await CommentsTableHelper.addComment({ id: 'comment-123' });
      await CommentsTableHelper.addRepliesByCommentId({ owner: 'user-999' });

      // Action & Assert
      await expect(
        replyRepository.verifyReplyOwner(fakeReplyId, fakeOwner)
      ).rejects.toThrow(AuthorizationError);
    });

    it('should not throw InvariantError or AuthorizationError if reply exist and owner have an access', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const fakeOwner = 'user-123';
      const fakeReplyId = 'reply-123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      await CommentsTableHelper.addComment({ id: 'comment-123' });
      await CommentsTableHelper.addRepliesByCommentId({ owner: 'user-123' });

      // Action & Assert
      await expect(
        replyRepository.verifyReplyOwner(fakeReplyId, fakeOwner)
      ).resolves.not.toThrow(NotFoundError);
      await expect(
        replyRepository.verifyReplyOwner(fakeReplyId, fakeOwner)
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteReplyById', () => {
    it('should delete reply from database', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const fakeReplyId = 'reply-123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      await CommentsTableHelper.addComment({ id: fakeCommentId });
      await CommentsTableHelper.addRepliesByCommentId({ id: fakeReplyId });

      // Action & Assert
      const replyStatus = await replyRepository.deleteReplyById(
        fakeThreadId,
        fakeCommentId,
        fakeReplyId
      );
      expect(replyStatus.is_delete).toStrictEqual(true);
    });
  });
});
