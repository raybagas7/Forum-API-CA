const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableHelper = require('../../../../tests/CommentsTableHelper');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

let token;
let threadId;

describe('/{threadId}/comment endpoint', () => {
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
        url: `/threads/xxx/comments`,
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
        url: `/threads/xxx/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer xxx` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Failed to make a new thread, authorization is invalid'
      );
    });
  });
});
