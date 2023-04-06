const NewReply = require('../../Domains/replies/entities/NewReply');

class AddNewRepliesUseCase {
  constructor({ commentRepository, replyRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, owner, threadId, commentId) {
    const newReply = new NewReply(useCasePayload);
    await this._threadRepository.checkThreadAvailability(threadId);
    await this._commentRepository.checkCommentAvailability(commentId);
    return this._replyRepository.addRepliesByCommentId(
      newReply,
      owner,
      threadId,
      commentId,
    );
  }
}

module.exports = AddNewRepliesUseCase;
