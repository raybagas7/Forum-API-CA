const DetailedThread = require('../../../Domains/threads/entities/DetailedThread');
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

  it('should orchestrating get thread action correctly', async () => {
    // Arrange
    const id = 'thread-123';

    const expectedDetailedThread = new DetailedThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-_pby2_tmXV6bcvcdev8xk',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
        },
        {
          id: 'comment-yksuCoxM2s4MMrZJO-qVD',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
        },
      ],
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getDetailThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedDetailedThread));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const detailedThread = await getDetailThreadUseCase.execute(id);

    // Assert
    expect(detailedThread).toStrictEqual(expectedDetailedThread);
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(id);
  });
});
