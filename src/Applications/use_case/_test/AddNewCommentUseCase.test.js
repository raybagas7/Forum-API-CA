const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddNewCommentUseCase = require('../AddNewCommentUseCase');

describe('AddNewCommentUseCase', () => {
  it('should orchestrating the add new comment action correctly', async () => {
    // Arrange
    const fakeOwner = 'user-123';
    const fakeThreadId = 'thread-123';
    const useCasePayload = {
      content: 'Comment on this thread',
    };

    const expectedNewComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: fakeOwner,
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedNewComment));
    mockThreadRepository.checkThreadAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const getNewCommentUseCase = new AddNewCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await getNewCommentUseCase.execute(
      useCasePayload,
      fakeOwner,
      fakeThreadId
    );

    // Assert
    expect(addedComment).toStrictEqual(expectedNewComment);
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(
      fakeThreadId
    );
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new NewComment({
        content: 'Comment on this thread',
      }),
      fakeOwner,
      fakeThreadId
    );
  });
});
