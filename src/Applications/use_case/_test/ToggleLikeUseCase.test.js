const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ToggleLikeUseCase = require('../ToggleLikeUseCase');

describe('ToggleLikeUseCase', () => {
  it('should throw error if not contain needed parameters', async () => {
    // Arrange
    const toggleLikeUseCase = new ToggleLikeUseCase({});

    // Action & Assert
    await expect(toggleLikeUseCase.execute())
      .rejects.toThrowError('TOGGLE_LIKE_USE_CASE.NOT_CONTAIN_NEEDED_PARAMETERS');
  });

  it('should throw error if all parameters not a string type', async () => {
    // Arrange
    const fakeUserId = 123;
    const fakeCommentId = ['comment-123'];

    const toggleLikeUseCase = new ToggleLikeUseCase({});

    // Action & Assert
    await expect(toggleLikeUseCase.execute(fakeUserId, fakeCommentId))
      .rejects.toThrowError('TOGGLE_LIKE_USE_CASE.PARAMETERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating add new like comment action correctly', async () => {
    const fakeUserId = 'user-123';
    const fakeCommentId = 'comment-123';

    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLikeAvailability = jest.fn(() => Promise.reject());
    mockLikeRepository.addNewLikeComment = jest.fn(() => Promise.resolve());

    const toggleLikeUseCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await toggleLikeUseCase.execute(fakeUserId, fakeCommentId);

    // Assert
    expect(mockLikeRepository.verifyLikeAvailability)
      .toHaveBeenCalledWith(fakeUserId, fakeCommentId);
    expect(mockLikeRepository.addNewLikeComment)
      .toHaveBeenCalledWith(fakeUserId, fakeCommentId);
  });

  it('should orchestrating toggle like commment action correctly', async () => {
    const fakeUserId = 'user-123';
    const fakeCommentId = 'comment-123';
    const fakeLike = true;

    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkThreadAvailability = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLikeAvailability = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.toggleLikeCommentById = jest.fn(() => Promise.resolve());

    const toggleLikeUseCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await toggleLikeUseCase.execute(fakeUserId, fakeCommentId);

    // Assert
    expect(mockLikeRepository.verifyLikeAvailability)
      .toHaveBeenCalledWith(fakeUserId, fakeCommentId);
    expect(mockLikeRepository.toggleLikeCommentById)
      .toHaveBeenCalledWith(fakeUserId, fakeCommentId, fakeLike);
  });
});
