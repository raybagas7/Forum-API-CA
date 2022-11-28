const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddNewThread = require('../AddNewThread');

describe('AddNewThread', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'New Thread',
      body: 'This is a kind of thread',
      owner: 'user-123',
    };

    const expectedNewThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedNewThread));

    //* make use case instance */
    const getNewThreadUseCase = new AddNewThread({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await getNewThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(expectedNewThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new NewThread({
        title: 'New Thread',
        body: 'This is a kind of thread',
        owner: 'user-123',
      })
    );
  });
});
