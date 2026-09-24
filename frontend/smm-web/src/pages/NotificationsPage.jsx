import {
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    Paper,
    Stack,
    Typography,
  } from '@mui/material';
  
  import CheckRoundedIcon
    from '@mui/icons-material/CheckRounded';
  
  import CloseRoundedIcon
    from '@mui/icons-material/CloseRounded';
  
  import FavoriteRoundedIcon
    from '@mui/icons-material/FavoriteRounded';
  
  import PersonAddRoundedIcon
    from '@mui/icons-material/PersonAddRounded';
  
  import {
    useMutation,
    useQuery,
    useQueryClient,
  } from '@tanstack/react-query';
  
  import {
    useSearchParams,
  } from 'react-router-dom';
  
  import {
    getNotifications,
    markNotificationAsRead,
  } from '../features/notifications/api/notificationsApi';
  
  import {
    acceptFriendRequest,
    getIncomingRequests,
    rejectFriendRequest,
  } from '../features/friends/api/friendsApi';
  
  import { API_ORIGIN }
    from '../config';
  
  export default function NotificationsPage() {
    const queryClient =
      useQueryClient();
  
    const [searchParams] =
      useSearchParams();
  
    const focusedRequestId =
      searchParams.get(
        'requestId'
      );
  
    const notificationsQuery =
      useQuery({
        queryKey: [
          'notifications',
        ],
        queryFn:
          getNotifications,
      });
  
    const requestsQuery =
      useQuery({
        queryKey: [
          'friend-requests',
        ],
        queryFn:
          getIncomingRequests,
      });
  
    const acceptMutation =
      useMutation({
        mutationFn:
          acceptFriendRequest,
  
        onSuccess: () => {
          refreshEverything();
        },
      });
  
    const rejectMutation =
      useMutation({
        mutationFn:
          rejectFriendRequest,
  
        onSuccess: () => {
          refreshEverything();
        },
      });
  
    const readMutation =
      useMutation({
        mutationFn:
          markNotificationAsRead,
  
        onSuccess: () => {
          queryClient
            .invalidateQueries({
              queryKey: [
                'notifications',
              ],
            });
  
          queryClient
            .invalidateQueries({
              queryKey: [
                'notification-unread-count',
              ],
            });
        },
      });
  
    function refreshEverything() {
      queryClient.invalidateQueries({
        queryKey: [
          'friend-requests',
        ],
      });
  
      queryClient.invalidateQueries({
        queryKey: ['friends'],
      });
  
      queryClient.invalidateQueries({
        queryKey: ['people'],
      });
  
      queryClient.invalidateQueries({
        queryKey: [
          'notifications',
        ],
      });
    }
  
    function getRequest(
      notification
    ) {
      if (
        notification.type !==
          'FriendRequest' ||
        !notification.friendRequestId
      ) {
        return null;
      }
  
      return requestsQuery.data?.find(
        (request) =>
          request.id ===
          notification.friendRequestId
      );
    }
  
    function getIcon(type) {
      switch (type) {
        case 'FriendRequest':
          return (
            <PersonAddRoundedIcon />
          );
  
        case 'PostLiked':
          return (
            <FavoriteRoundedIcon />
          );
  
        default:
          return null;
      }
    }
  
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 4,
        }}
      >
        <Box mb={3}>
          <Typography
            variant="h4"
            fontWeight={950}
          >
            Notifications
          </Typography>
  
          <Typography
            color="text.secondary"
          >
            Everything happening
            around your account.
          </Typography>
        </Box>
  
        <Stack spacing={1.7}>
          {notificationsQuery
            .data?.items?.map(
              (notification) => {
                const request =
                  getRequest(
                    notification
                  );
  
                const avatar =
                  notification
                    .actorProfileImageUrl
                    ? notification
                        .actorProfileImageUrl
                        .startsWith(
                          'http'
                        )
                      ? notification
                          .actorProfileImageUrl
                      : `${API_ORIGIN}${notification.actorProfileImageUrl}`
                    : null;
  
                const focused =
                  focusedRequestId ===
                  notification
                    .friendRequestId;
  
                return (
                  <Paper
                    key={
                      notification.id
                    }
                    elevation={0}
                    onClick={() => {
                      if (
                        !notification
                          .isRead
                      ) {
                        readMutation
                          .mutate(
                            notification.id
                          );
                      }
                    }}
                    sx={{
                      p: 2.3,
  
                      borderRadius: 4,
  
                      border:
                        '1px solid',
  
                      borderColor:
                        focused
                          ? 'primary.main'
                          : 'rgba(148,163,184,.16)',
  
                      bgcolor:
                        notification
                          .isRead
                          ? 'white'
                          : 'rgba(239,246,255,.72)',
  
                      boxShadow:
                        focused
                          ? '0 15px 45px rgba(37,99,235,.15)'
                          : '0 12px 35px rgba(15,23,42,.05)',
  
                      transition:
                        'all .2s ease',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          position:
                            'relative',
                        }}
                      >
                        <Avatar
                          src={
                            avatar ||
                            undefined
                          }
                          sx={{
                            width: 52,
                            height: 52,
                          }}
                        >
                          {
                            notification
                              .actorFirstName?.[0]
                          }
                        </Avatar>
  
                        <Box
                          sx={{
                            position:
                              'absolute',
  
                            right: -4,
                            bottom: -4,
  
                            width: 26,
                            height: 26,
  
                            borderRadius:
                              '50%',
  
                            display:
                              'grid',
  
                            placeItems:
                              'center',
  
                            bgcolor:
                              'primary.main',
  
                            color:
                              'white',
  
                            border:
                              '3px solid white',
  
                            '& svg': {
                              fontSize: 14,
                            },
                          }}
                        >
                          {getIcon(
                            notification
                              .type
                          )}
                        </Box>
                      </Box>
  
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight:
                              notification
                                .isRead
                                ? 600
                                : 800,
                          }}
                        >
                          {
                            notification
                              .message
                          }
                        </Typography>
  
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {new Date(
                            notification
                              .createdAt
                          ).toLocaleString()}
                        </Typography>
  
                        {request && (
                          <Box
                            sx={{
                              display:
                                'flex',
  
                              gap: 1,
  
                              mt: 1.7,
                            }}
                          >
                            <Button
                              variant="contained"
                              startIcon={
                                <CheckRoundedIcon />
                              }
                              disabled={
                                acceptMutation
                                  .isPending
                              }
                              onClick={(
                                event
                              ) => {
                                event
                                  .stopPropagation();
  
                                acceptMutation
                                  .mutate(
                                    request.id
                                  );
                              }}
                              sx={{
                                borderRadius:
                                  999,
  
                                px: 2.5,
  
                                textTransform:
                                  'none',
  
                                fontWeight: 800,
                              }}
                            >
                              Accept
                            </Button>
  
                            <Button
                              variant="outlined"
                              color="inherit"
                              startIcon={
                                <CloseRoundedIcon />
                              }
                              disabled={
                                rejectMutation
                                  .isPending
                              }
                              onClick={(
                                event
                              ) => {
                                event
                                  .stopPropagation();
  
                                rejectMutation
                                  .mutate(
                                    request.id
                                  );
                              }}
                              sx={{
                                borderRadius:
                                  999,
  
                                px: 2.5,
  
                                textTransform:
                                  'none',
  
                                fontWeight: 800,
                              }}
                            >
                              Decline
                            </Button>
                          </Box>
                        )}
  
                        {notification.type ===
                          'FriendRequest' &&
                          !request && (
                            <Chip
                              icon={
                                <CheckRoundedIcon />
                              }
                              label="Request handled"
                              size="small"
                              sx={{
                                mt: 1.5,
                                fontWeight:
                                  700,
                              }}
                            />
                          )}
                      </Box>
                    </Box>
                  </Paper>
                );
              }
            )}
        </Stack>
      </Container>
    );
  }