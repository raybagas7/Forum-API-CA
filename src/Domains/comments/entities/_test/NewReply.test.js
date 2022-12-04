const NewReply = require('../NewReply');

describe('a NewReply entitis', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError(
      'NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type spesification', () => {
    // Arrange
    const payload = {
      content: 123,
    };

    // Action & Assert
    expect(() =>
      new NewReply(payload).toThrowError(
        'NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
      )
    );
  });

  it('should create newReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'This is reply',
    };

    // Action
    const { content } = new NewReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
  });
});
