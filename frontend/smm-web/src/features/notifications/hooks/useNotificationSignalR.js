import { useEffect } from 'react';

import {
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';

import { useQueryClient } from '@tanstack/react-query';

import { API_ORIGIN } from '../../../config';
import { useAuthStore } from '../../auth/store/authStore';

export default function useNotificationSignalR() {
  const queryClient = useQueryClient();

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const connection =
      new HubConnectionBuilder()
        .withUrl(
          `${API_ORIGIN}/hubs/notifications`,
          {
            accessTokenFactory: () =>
              useAuthStore.getState()
                .accessToken,
          }
        )
        .withAutomaticReconnect()
        .configureLogging(
          LogLevel.Information
        )
        .build();

    connection.on(
      'notificationReceived',
      (notification) => {
        queryClient.setQueryData(
          ['notifications'],
          (old) => {
            if (!old) {
              return {
                items: [notification],
                totalCount: 1,
              };
            }

            return {
              ...old,

              items: [
                notification,
                ...(old.items ?? []),
              ],

              totalCount:
                (old.totalCount ?? 0) + 1,
            };
          }
        );

        queryClient.setQueryData(
          ['notification-unread-count'],
          (old) => ({
            count:
              (old?.count ?? 0) + 1,
          })
        );

        queryClient.invalidateQueries({
          queryKey: ['friend-requests'],
        });

        queryClient.invalidateQueries({
          queryKey: ['friends'],
        });
      }
    );

    connection
      .start()
      .catch((error) => {
        console.error(
          'SignalR connection error:',
          error
        );
      });

    return () => {
      connection.stop();
    };
  }, [
    accessToken,
    queryClient,
  ]);
}