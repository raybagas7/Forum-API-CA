class GetDetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(id) {
    this._validateParameters(id);
    return await this._threadRepository.getDetailThread(id);
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
