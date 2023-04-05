const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should throw error if parameter not contain thread id', async () => {
    // Arrange
    const getDetailThreadUseCase = new GetDetailThreadUseCase({});

    // Action & Assert
    await expect(getDetailThreadUseCase.execute()).rejects.toThrowError(
      'GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PARAMETER'
    );
  });

  it('should throw error if id not string type', async () => {
    // Arrange
    const id = [123, true];

    const getDetailThreadUseCase = new GetDetailThreadUseCase({});

    // Action & Assert
    await expect(getDetailThreadUseCase.execute(id)).rejects.toThrowError(
      'GET_DETAIL_THREAD_USE_CASE.ID_NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should orchestrating get thread action correctly with comments has no replies', async () => {
    // Arrange
    const id = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getDetailThread = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:19:09.775Z',
        username: 'dicoding',
      })
    );

    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: 'comment-123',
            username: 'johndoe',
            date: '2021-08-08T07:22:33.555Z',
            content: 'sebuah comment',
            is_delete: false,
          },
        ])
      );

    mockReplyRepository.getReplyByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailedThread = await getDetailThreadUseCase.execute(id);

    // Assert
    expect(detailedThread).toStrictEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
          replies: [],
        },
      ],
    });

    expect(detailedThread.comments[0].replies).toStrictEqual([]);
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(id);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(id);
    expect(mockReplyRepository.getReplyByThreadId).toBeCalledWith(id);
  });

  it('should orchestrating get thread action correctly with deleted comments and replies', async () => {
    // Arrange
    const id = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getDetailThread = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:19:09.775Z',
        username: 'dicoding',
      })
    );

    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: 'comment-123',
            username: 'johndoe',
            date: '2021-08-08T07:22:33.555Z',
            content: 'sebuah comment',
            is_delete: false,
          },
          {
            id: 'comment-321',
            username: 'dicoding',
            date: '2021-08-08T07:26:21.338Z',
            content: '**komentar telah dihapus**',
            is_delete: true,
          },
        ])
      );

    mockReplyRepository.getReplyByThreadId = jest.fn().mockImplementation(() =>
      Promise.resolve([
        {
          id: 'reply-123',
          username: 'johndoe',
          date: '2022-08-08T07:22:33.555Z',
          content: 'sebuah reply',
          is_delete: true,
          comment_id: 'comment-123',
        },
      ])
    );

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailedThread = await getDetailThreadUseCase.execute(id);

    // Assert
    expect(detailedThread).toStrictEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
          replies: [
            {
              id: 'reply-123',
              username: 'johndoe',
              date: '2022-08-08T07:22:33.555Z',
              content: '**balasan telah dihapus**',
            },
          ],
        },
        {
          id: 'comment-321',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
        },
      ],
    });
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(id);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(id);
    expect(mockReplyRepository.getReplyByThreadId).toBeCalledWith(id);
  });

  it('should orchestrating get thread action correctly with comments and replies', async () => {
    // Arrange
    const id = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getDetailThread = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:19:09.775Z',
        username: 'dicoding',
      })
    );

    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([
          {
            id: 'comment-123',
            username: 'johndoe',
            date: '2021-08-08T07:22:33.555Z',
            content: 'sebuah comment',
            is_delete: false,
          },
          {
            id: 'comment-321',
            username: 'dicoding',
            date: '2021-08-08T07:26:21.338Z',
            content: '**komentar telah dihapus**',
            is_delete: true,
          },
        ])
      );

    mockReplyRepository.getReplyByThreadId = jest.fn().mockImplementation(() =>
      Promise.resolve([
        {
          id: 'reply-123',
          username: 'johndoe',
          date: '2022-08-08T07:22:33.555Z',
          content: 'sebuah reply',
          is_delete: false,
          comment_id: 'comment-123',
        },
      ])
    );

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailedThread = await getDetailThreadUseCase.execute(id);

    // Assert
    expect(detailedThread).toStrictEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
          replies: [
            {
              id: 'reply-123',
              username: 'johndoe',
              date: '2022-08-08T07:22:33.555Z',
              content: 'sebuah reply',
            },
          ],
        },
        {
          id: 'comment-321',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
        },
      ],
    });
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(id);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(id);
    expect(mockReplyRepository.getReplyByThreadId).toBeCalledWith(id);
  });
});
