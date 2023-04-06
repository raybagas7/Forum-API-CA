const AddNewCommentUseCase = require('../../../../Applications/use_case/AddNewCommentUseCase');
const AddNewRepliesUseCase = require('../../../../Applications/use_case/AddNewRepliesUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');
const ToggleLikeUseCase = require('../../../../Applications/use_case/ToggleLikeUseCase');

class CommentHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
    this.likeCommentHandler = this.likeCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addNewCommentUseCase = this._container.getInstance(
      AddNewCommentUseCase.name,
    );

    const { threadId: thread_Id } = request.params;
    const { id: owner } = request.auth.credentials;

    const addedComment = await addNewCommentUseCase.execute(
      request.payload,
      owner,
      thread_Id,
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
      DeleteCommentUseCase.name,
    );

    const { threadId: thread_Id, commentId: comment_id } = request.params;
    const { id: owner } = request.auth.credentials;

    await deleteCommentUseCase.execute(thread_Id, comment_id, owner);

    return { status: 'success' };
  }

  async postReplyHandler(request, h) {
    const addNewRepliesUseCase = this._container.getInstance(
      AddNewRepliesUseCase.name,
    );

    const { threadId: thread_Id, commentId: comment_id } = request.params;
    const { id: owner } = request.auth.credentials;

    const addedReply = await addNewRepliesUseCase.execute(
      request.payload,
      owner,
      thread_Id,
      comment_id,
    );

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request) {
    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name,
    );

    const {
      threadId: thread_Id,
      commentId: comment_id,
      replyId: reply_id,
    } = request.params;
    const { id: owner } = request.auth.credentials;

    await deleteReplyUseCase.execute(thread_Id, comment_id, reply_id, owner);

    return { status: 'success' };
  }

  async likeCommentHandler(request) {
    const toggleLikeUseCase = this._container.getInstance(
      ToggleLikeUseCase.name,
    );

    const {
      threadId: thread_Id,
      commentId: comment_id,
    } = request.params;
    const { id: user_id } = request.auth.credentials;

    await toggleLikeUseCase.execute(user_id, comment_id, thread_Id);

    return { status: 'success' };
  }
}

module.exports = CommentHandler;
