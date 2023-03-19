const { mapDBToModelDetailThread } = require('../../Infrastructures/utils');

class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(id) {
    this._validateParameters(id);
    const resultThreadData = await this._threadRepository.getDetailThread(id);
    const resultCommentsData =
      await this._commentRepository.getCommentByThreadId(id);
    const resultRepliesData = await this._replyRepository.getReplyByThreadId(
      id
    );

    return mapDBToModelDetailThread(
      resultThreadData,
      resultCommentsData,
      resultRepliesData
    );
  }

  _validateParameters(id) {
    if (!id) {
      throw new Error(
        'GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PARAMETER'
      );
    }

    if (typeof id !== 'string') {
      throw new Error(
        'GET_DETAIL_THREAD_USE_CASE.ID_NOT_MEET_DATA_TYPE_SPECIFICATION'
      );
    }
  }
}

module.exports = GetDetailThreadUseCase;
