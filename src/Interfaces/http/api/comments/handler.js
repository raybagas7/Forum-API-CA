const AddNewCommentUseCase = require('../../../../Applications/use_case/AddNewCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addNewCommentUseCase = this._container.getInstance(
      AddNewCommentUseCase.name
    );

    const { threadId: thread_Id } = request.params;
    const { id: owner } = request.auth.credentials;

    const addedComment = await addNewCommentUseCase.execute(
      request.payload,
      owner,
      thread_Id
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

  async deleteCommentHandler(request) {
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name
    );

    const { threadId: thread_Id, commentId: comment_id } = request.params;
    const { id: owner } = request.auth.credentials;

    await deleteCommentUseCase.execute(thread_Id, comment_id, owner);

    return { status: 'success' };
  }
}

module.exports = CommentHandler;
