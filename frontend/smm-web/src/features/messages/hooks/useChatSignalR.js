import { useEffect } from 'react';

import {
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';

import {
  useQueryClient,
} from '@tanstack/react-query';

import { API_ORIGIN }
  from '../../../config';

import { useAuthStore }
  from '../../auth/store/authStore';

import {
  playMessageSound,
} from '../../../utils/messageSound';

export default function useChatSignalR() {
  const queryClient =
    useQueryClient();

  const accessToken =
    useAuthStore(
      (state) =>
        state.accessToken
    );

  const currentUser =
    useAuthStore(
      (state) => state.user
    );

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const connection =
      new HubConnectionBuilder()
        .withUrl(
          `${API_ORIGIN}/hubs/chat`,
          {
            accessTokenFactory:
              () =>
                useAuthStore
                  .getState()
                  .accessToken ??
                '',
          }
        )
        .withAutomaticReconnect()
        .configureLogging(
          LogLevel.Information
        )
        .build();

    connection.on(
      'messageReceived',
      (message) => {
        // Open conversation cache
        queryClient.setQueryData(
          [
            'messages',
            message.conversationId,
          ],
          (old) => {
            if (!old) {
              return old;
            }

            if (
              old.items?.some(
                (x) =>
                  x.id ===
                  message.id
              )
            ) {
              return old;
            }

            return {
              ...old,

              items: [
                ...(old.items ??
                  []),

                message,
              ],

              totalCount:
                (old.totalCount ??
                  0) + 1,
            };
          }
        );

        // conversation list
        queryClient.invalidateQueries({
          queryKey: [
            'conversations',
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            'message-unread-count',
          ],
        });

        // Öz göndərdiyimiz event deyilsə
        if (
          message.senderId !==
          currentUser?.userId
        ) {
          playMessageSound();
        }
      }
    );

    connection.on(
      'messageSent',
      (message) => {
        queryClient.setQueryData(
          [
            'messages',
            message.conversationId,
          ],
          (old) => {
            if (!old) {
              return old;
            }

            if (
              old.items?.some(
                (x) =>
                  x.id ===
                  message.id
              )
            ) {
              return old;
            }

            return {
              ...old,

              items: [
                ...(old.items ??
                  []),
                message,
              ],
            };
          }
        );

        queryClient.invalidateQueries({
          queryKey: [
            'conversations',
          ],
        });
      }
    );

    connection.on(
      'messagesRead',
      ({
        conversationId,
        readAt,
      }) => {
        queryClient.setQueryData(
          [
            'messages',
            conversationId,
          ],
          (old) => {
            if (!old) {
              return old;
            }

            return {
              ...old,

              items:
                old.items?.map(
                  (message) => ({
                    ...message,

                    isRead:
                      true,

                    readAt,
                  })
                ) ?? [],
            };
          }
        );
      }
    );

    connection.on(
      'userOnline',
      () => {
        queryClient.invalidateQueries({
          queryKey: [
            'conversations',
          ],
        });
      }
    );

    connection.on(
      'userOffline',
      () => {
        queryClient.invalidateQueries({
          queryKey: [
            'conversations',
          ],
        });
      }
    );

    connection
      .start()
      .catch((error) => {
        console.error(
          'Chat SignalR error:',
          error
        );
      });

    return () => {
      connection.stop();
    };
  }, [
    accessToken,
    currentUser?.userId,
    queryClient,
  ]);
}