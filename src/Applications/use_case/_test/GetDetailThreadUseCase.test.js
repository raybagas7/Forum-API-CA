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
    const mockThreadRepository = new ThreadRepository();
  });
});
