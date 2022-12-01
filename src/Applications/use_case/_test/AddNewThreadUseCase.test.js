const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddNewThreadUseCase = require('../AddNewThreadUseCase');

describe('AddNewThread', () => {
  it('should orchestrating the add new thread action correctly', async () => {
    // Arrange
    const fakeOwner = 'user-123';
    const useCasePayload = {
      title: 'New Thread',
      body: 'This is a kind of thread',
    };

    const expectedNewThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: fakeOwner,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedNewThread));

    //* make use case instance */
    const getNewThreadUseCase = new AddNewThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await getNewThreadUseCase.execute(
      useCasePayload,
      fakeOwner
    );

    // Assert
    expect(addedThread).toStrictEqual(expectedNewThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new NewThread({
        title: 'New Thread',
        body: 'This is a kind of thread',
      }),
      fakeOwner
    );
  });
});
