const AddNewThreadUseCase = require('../../../../Applications/use_case/AddNewThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/GetDetailThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addNewThreadUseCase = this._container.getInstance(
      AddNewThreadUseCase.name,
    );
    const { id: owner } = request.auth.credentials;

    const addedThread = await addNewThreadUseCase.execute(
      request.payload,
      owner,
    );

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getDetailThreadHandler(request, h) {
    const getDetailThreadUseCase = this._container.getInstance(
      GetDetailThreadUseCase.name,
    );

    const { threadId: thread_id } = request.params;

    const thread = await getDetailThreadUseCase.execute(thread_id);

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    return response;
  }
}

module.exports = ThreadsHandler;
