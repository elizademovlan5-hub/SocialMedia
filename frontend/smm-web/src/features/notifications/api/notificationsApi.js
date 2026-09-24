import api from '../../../api/axios';

export async function getNotifications() {
  const response = await api.get(
    '/notifications',
    {
      params: {
        page: 1,
        pageSize: 20,
      },
    }
  );

  return response.data;
}

export async function getUnreadCount() {
  const response = await api.get(
    '/notifications/unread-count'
  );

  return response.data;
}

export async function markNotificationAsRead(
  id
) {
  await api.patch(
    `/notifications/${id}/read`
  );
}

export async function markAllNotificationsAsRead() {
  await api.patch(
    '/notifications/read-all'
  );
}