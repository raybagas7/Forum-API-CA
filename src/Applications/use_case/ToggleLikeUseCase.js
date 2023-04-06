class ToggleLikeUseCase {
  constructor({ likeRepository, threadRepository, commentRepository }) {
    this._likeRepository = likeRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(user_id, comment_id, thread_id) {
    this._validateParameters(user_id, comment_id);
    await this._threadRepository.checkThreadAvailability(thread_id);
    await this._commentRepository.checkCommentAvailability(comment_id);
    try {
      const isLike = await this._likeRepository.verifyLikeAvailability(user_id, comment_id);
      await this._likeRepository.toggleLikeCommentById(user_id, comment_id, isLike);
    } catch (e) {
      await this._likeRepository.addNewLikeComment(user_id, comment_id);
    }
  }

  _validateParameters(user_id, comment_id) {
    if (!user_id || !comment_id) {
      throw new Error('TOGGLE_LIKE_USE_CASE.NOT_CONTAIN_NEEDED_PARAMETERS');
    }

    if (
      typeof user_id !== 'string'
        || typeof comment_id !== 'string'
    ) {
      throw new Error('TOGGLE_LIKE_USE_CASE.PARAMETERS_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ToggleLikeUseCase;
