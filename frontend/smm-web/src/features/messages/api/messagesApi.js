import api from '../../../api/axios';

export async function getConversations() {
  const response = await api.get(
    '/messages/conversations'
  );

  return response.data;
}

export async function openConversation(friendId) {
  const response = await api.post(
    `/messages/conversations/open/${friendId}`
  );

  return response.data;
}

export async function getMessages(
  conversationId,
  page = 1,
  pageSize = 50
) {
  const response = await api.get(
    `/messages/conversations/${conversationId}`,
    {
      params: {
        page,
        pageSize,
      },
    }
  );

  return response.data;
}

export async function sendMessage(
  conversationId,
  content
) {
  const response = await api.post(
    `/messages/conversations/${conversationId}`,
    {
      content,
    }
  );

  return response.data;
}

export async function markConversationRead(
  conversationId
) {
  await api.patch(
    `/messages/conversations/${conversationId}/read`
  );
}

export async function getMessageUnreadCount() {
  const response = await api.get(
    '/messages/unread-count'
  );

  return response.data;
}