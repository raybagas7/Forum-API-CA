const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableHelper = require('../../../../tests/CommentsTableHelper');
const LikesTableHelper = require('../../../../tests/LikesTableHelper');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

let token;
let threadId;

describe('/threads/{threadId}/comment endpoint', () => {
  beforeEach(async () => {
    const server = await createServer(container);

    // Add User Thread Owner
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    // Get Thread Owner Token
    const responseToken = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret',
      },
    });

    const {
      data: { accessToken },
    } = JSON.parse(responseToken.payload);

    token = accessToken;

    // Add Thread
    const requestThreadPayload = {
      title: 'New Thread',
      body: 'This is a kind of thread',
    };

    // Action
    const responseThread = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestThreadPayload,
      headers: { Authorization: `Bearer ${token}` },
    });

    const {
      data: {
        addedThread: { id },
      },
    } = JSON.parse(responseThread.payload);

    threadId = id;
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableHelper.cleanTable();
    await LikesTableHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'New comment for this thread',
      };

      const server = await createServer(container);

      // Add User Comment Owner
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'netizen',
          password: 'secret',
          fullname: 'Netizen Indonesia',
        },
      });

      // Get Netizen Owner Token
      const responseNetizenToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'netizen',
          password: 'secret',
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(responseNetizenToken.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 404 when thread id not exist', async () => {
      // Arrange
      const requestPayload = {
        content: 'New comment for this thread',
      };

      const server = await createServer(container);

      // Add User Comment Owner
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'netizen',
          password: 'secret',
          fullname: 'Netizen Indonesia',
        },
      });

      // Get Netizen Owner Token
      const responseNetizenToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'netizen',
          password: 'secret',
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(responseNetizenToken.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual("Thread doesn't exist");
    });

    it('should response 401 when unauthorized', async () => {
      // Arrange
      const requestPayload = {
        content: 'New comment for this thread',
      };

      const server = await createServer(container);

      // Add User Comment Owner
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'netizen',
          password: 'secret',
          fullname: 'Netizen Indonesia',
        },
      });

      // Get Netizen Owner Token
      const responseNetizenToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'netizen',
          password: 'secret',
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(responseNetizenToken.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments',
        payload: requestPayload,
        headers: { Authorization: 'Bearer xxx' },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Failed to make a new thread, authorization is invalid',
      );
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 201 and delete comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'New comment for this thread',
      };

      const server = await createServer(container);

      // Add Comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        data: {
          addedComment: { id },
        },
      } = JSON.parse(responseComment.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${id}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when unauthorized', async () => {
      // Arrange
      const requestPayload = {
        content: 'New comment for this thread',
      };

      const server = await createServer(container);

      // Add Comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        data: {
          addedComment: { id },
        },
      } = JSON.parse(responseComment.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${id}`,
        headers: { Authorization: 'Bearer token-123' },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Failed to make a new thread, authorization is invalid',
      );
    });

    it('should response 404 when comment id not exist', async () => {
      // Arrange
      const requestPayload = {
        content: 'New comment for this thread',
      };

      const server = await createServer(container);

      // Add Comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        data: {
          addedComment: { id },
        },
      } = JSON.parse(responseComment.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/xxx`,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual("Comment doesn't exist");
    });
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is my reply',
      };

      const server = await createServer(container);

      // Add Comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        data: {
          addedComment: { id },
        },
      } = JSON.parse(responseComment.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${id}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 404 when comment id not exist', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is my reply',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/xxx/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual("Comment doesn't exist");
    });

    it('should response 404 when thread id not exist', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is my reply',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments/xxx/replies',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual("Thread doesn't exist");
    });

    it('should response 401 when unauthorized', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is my reply',
      };

      const server = await createServer(container);

      // Add Comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        data: {
          addedComment: { id },
        },
      } = JSON.parse(responseComment.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${id}/replies`,
        payload: requestPayload,
        headers: { Authorization: 'Bearer xxx' },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Failed to make a new thread, authorization is invalid',
      );
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 201 and delete reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'New reply for this comment',
      };

      const server = await createServer(container);

      // Add Comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        data: {
          addedComment: { id },
        },
      } = JSON.parse(responseComment.payload);

      // Add Reply
      const responseReply = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${id}/replies`,
        payload: {
          content: 'This is my reply',
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        data: {
          addedReply: { id: replyId },
        },
      } = JSON.parse(responseReply.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${id}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when unauthorized', async () => {
      // Arrange
      const requestPayload = {
        content: 'New reply for this comment',
      };

      const server = await createServer(container);

      // Add Comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        data: {
          addedComment: { id },
        },
      } = JSON.parse(responseComment.payload);

      const responseReply = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${id}/replies`,
        payload: {
          content: 'This is my reply',
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        data: {
          addedReply: { id: replyId },
        },
      } = JSON.parse(responseReply.payload);
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${id}/replies/${replyId}`,
        headers: { Authorization: 'Bearer xxx' },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Failed to make a new thread, authorization is invalid',
      );
    });

    it('should reponse 404 when reply id not exist', async () => {
      // Arrange
      const requestPayload = {
        content: 'New reply for this comment',
      };

      const server = await createServer(container);

      // Add Comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        data: {
          addedComment: { id },
        },
      } = JSON.parse(responseComment.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${id}/replies/xxx`,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual("Reply doesn't exist");
    });
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and add new likes', async () => {
      // Arrange
      const requestPayload = {
        content: 'New comment',
      };
      const server = await createServer(container);

      // Add Comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        data: {
          addedComment: { id },
        },
      } = JSON.parse(responseComment.payload);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${id}/likes`,
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when unauthorized', async () => {
      // Arrange
      const requestPayload = {
        content: 'New comment',
      };
      const server = await createServer(container);

      // Add Comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const {
        data: {
          addedComment: { id },
        },
      } = JSON.parse(responseComment.payload);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${id}/likes`,
        headers: { Authorization: 'Bearer xxx' },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Failed to make a new thread, authorization is invalid',
      );
    });
  });
});
