class DeleteReplyUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(threadId, commentId, replyId, owner) {
    this._validateParameters(threadId, commentId, replyId, owner);
    await this._commentRepository.verifyReplyOwner(replyId, owner);
    await this._commentRepository.deleteReplyById(threadId, commentId, replyId);
  }

  _validateParameters(threadId, commentId, replyId, owner) {
    if (!threadId || !commentId || !replyId || !owner) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_PARAMETERS');
    }

    if (
      typeof threadId !== 'string' ||
      typeof commentId !== 'string' ||
      typeof replyId !== 'string' ||
      typeof owner !== 'string'
    ) {
      throw new Error(
        'DELETE_REPLY_USE_CASE.ID_NOT_MEET_DATA_TYPE_SPECIFICATION'
      );
    }
  }
}

module.exports = DeleteReplyUseCase;
