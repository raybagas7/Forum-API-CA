const NewReply = require('../../Domains/comments/entities/NewReply');

class AddNewRepliesUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, owner, threadId, commentId) {
    const newReply = new NewReply(useCasePayload);
    await this._threadRepository.checkThreadAvailability(threadId);
    await this._commentRepository.checkCommentAvailability(commentId);
    return this._commentRepository.addRepliesByCommentId(
      newReply,
      owner,
      threadId,
      commentId
    );
  }
}

module.exports = AddNewRepliesUseCase;
