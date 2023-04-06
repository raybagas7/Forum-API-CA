const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action & Assert
    await expect(
      replyRepository.addRepliesByCommentId({}),
    ).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.getReplyByThreadId('')).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(replyRepository.deleteReplyById('')).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(replyRepository.verifyReplyOwner('')).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
