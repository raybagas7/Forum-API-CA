const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase.test', () => {
  it('should throw error if parameters not contain one of or both owner id or comment id', async () => {
    // Arrange
    const fakeOwnerId = 'user-123';
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute(fakeOwnerId),
    ).rejects.toThrowError(
      'DELETE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PARAMETERS',
    );
  });

  it('should throw error if owner id or comment id not string type', async () => {
    // Arrange
    const fakeThreadId = true;
    const fakeOwnerId = 123;
    const fakeCommentId = ['comment-id'];

    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute(fakeThreadId, fakeCommentId, fakeOwnerId),
    ).rejects.toThrowError(
      'DELETE_COMMENT_USE_CASE.ID_NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should ochestrating delete comment action correctly', async () => {
    // Arramge
    const fakeThreadId = 'thread-123';
    const fakeOwnerId = 'user-123';
    const fakeCommentId = 'comment-123';
    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(
      fakeThreadId,
      fakeCommentId,
      fakeOwnerId,
    );

    // Assert
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(
      fakeCommentId,
      fakeOwnerId,
    );
    expect(mockCommentRepository.deleteCommentById).toHaveBeenCalledWith(
      fakeThreadId,
      fakeCommentId,
    );
  });
});
