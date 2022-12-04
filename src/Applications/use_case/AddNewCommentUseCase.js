const NewComment = require('../../Domains/comments/entities/NewComment');

class AddNewCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, owner, threadId) {
    const newComment = new NewComment(useCasePayload);
    await this._threadRepository.checkThreadAvailability(threadId);
    return this._commentRepository.addComment(newComment, owner, threadId);
  }
}

module.exports = AddNewCommentUseCase;
