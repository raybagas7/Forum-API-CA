const AddNewCommentUseCase = require('../../../../Applications/use_case/AddNewCommentUseCase');

class CommentHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addNewCommentUseCase = this._container.getInstance(
      AddNewCommentUseCase.name
    );

    const { threadId: thread_id } = request.params;
    const { id: owner } = request.auth.credentials;

    const addedComment = await addNewCommentUseCase.execute(
      request.payload,
      owner,
      thread_id
    );

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = CommentHandler;
