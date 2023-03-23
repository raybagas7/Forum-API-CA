const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddNewRepliesUseCase = require('../AddNewRepliesUseCase');

describe('AddNewRepliesUseCase', () => {
  it('should orchestrating the add new comment action correctly', async () => {
    // Arrange
    const fakeOwner = 'user-123';
    const fakeThreadId = 'thread-123';
    const fakeCommentId = 'comment-123';
    const useCasePayload = {
      content: 'Replies on this comment',
    };

    const expectedNewReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: fakeOwner,
    });

    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.checkCommentAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.checkThreadAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addRepliesByCommentId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(new AddedReply({
      id: 'reply-123',
      content: 'Replies on this comment',
      owner: 'user-123',
    })));
    mockCommentRepository;

    const getNewRepliesUseCase = new AddNewRepliesUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await getNewRepliesUseCase.execute(
      useCasePayload,
      fakeOwner,
      fakeThreadId,
      fakeCommentId
    );

    // Assert
    expect(addedReply).toStrictEqual(expectedNewReply);
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(
      fakeThreadId
    );
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith(
      fakeCommentId
    );
    expect(mockReplyRepository.addRepliesByCommentId).toBeCalledWith(
      new NewReply({
        content: 'Replies on this comment',
      }),
      fakeOwner,
      fakeThreadId,
      fakeCommentId
    );
  });
});
