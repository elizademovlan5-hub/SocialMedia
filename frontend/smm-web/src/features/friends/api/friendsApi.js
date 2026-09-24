import api from '../../../api/axios';

export async function getFriends() {
  const response = await api.get('/friends');
  return response.data;
}

export async function getIncomingRequests() {
  const response = await api.get(
    '/friends/requests/incoming'
  );

  return response.data;
}

export async function getOutgoingRequests() {
  const response = await api.get(
    '/friends/requests/outgoing'
  );

  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await api.post(
    `/friends/requests/${userId}`
  );

  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await api.post(
    `/friends/requests/${requestId}/accept`
  );

  return response.data;
}

export async function rejectFriendRequest(requestId) {
  await api.post(
    `/friends/requests/${requestId}/reject`
  );
}

export async function cancelFriendRequest(requestId) {
  await api.delete(
    `/friends/requests/${requestId}`
  );
}

export async function removeFriend(friendId) {
  await api.delete(
    `/friends/${friendId}`
  );
}

export async function searchUsers(search = '') {
    const response = await api.get(
      '/users/search',
      {
        params: {
          search,
        },
      }
    );
  
    return response.data;
  }