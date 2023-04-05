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

    const result = {
      id: resultThreadData.id,
      title: resultThreadData.title,
      body: resultThreadData.body,
      date: resultThreadData.date,
      username: resultThreadData.username,
      comments: resultCommentsData.map((comment) => {
        if (comment.is_delete === false) {
          return {
            id: comment.id,
            username: comment.username,
            date: comment.date,
            content: comment.content,
            replies: resultRepliesData.flatMap((reply) => {
              /* istanbul ignore next */
              if (reply.comment_id !== comment.id) {
                return [];
              }
              if (reply.is_delete === false) {
                return {
                  id: reply.id,
                  username: reply.username,
                  date: reply.date,
                  content: reply.content,
                };
              }
              return {
                id: reply.id,
                username: reply.username,
                date: reply.date,
                content: '**balasan telah dihapus**',
              };
            }),
          };
        } else {
          return {
            id: comment.id,
            username: comment.username,
            date: comment.date,
            content: '**komentar telah dihapus**',
          };
        }
      }),
    };

    return result;
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
