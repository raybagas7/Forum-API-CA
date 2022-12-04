const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should throw error if not contain needed parameters', async () => {
    // Arrange
    const fakeOwnerId = 'user-123';
    const fakeThreadId = 'thread-123';
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(fakeOwnerId, fakeThreadId)
    ).rejects.toThrowError(
      'DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PARAMETERS'
    );
  });

  it('should throw error if all parameters not string type', async () => {
    // Arrange
    const fakeThreadId = true;
    const fakeOwnerId = 123;
    const fakeCommentId = ['comment-id'];
    const fakeReplyId = 321;

    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(
        fakeThreadId,
        fakeCommentId,
        fakeOwnerId,
        fakeReplyId
      )
    ).rejects.toThrowError(
      'DELETE_REPLY_USE_CASE.ID_NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should ochestrating delete reply action correctly', async () => {
    // Arrange
    const fakeThreadId = 'thread-123';
    const fakeOwnerId = 'user-123';
    const fakeCommentId = 'comment-123';
    const fakeReplyId = 'reply-123';

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.verifyReplyOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteReplyById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteReplyUseCase.execute(
      fakeThreadId,
      fakeCommentId,
      fakeReplyId,
      fakeOwnerId
    );

    // Assert
    expect(mockCommentRepository.verifyReplyOwner).toHaveBeenCalledWith(
      fakeReplyId,
      fakeOwnerId
    );
    expect(mockCommentRepository.deleteReplyById).toHaveBeenCalledWith(
      fakeThreadId,
      fakeCommentId,
      fakeReplyId
    );
  });
});
