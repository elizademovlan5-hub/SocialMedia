import {
    Avatar,
    Badge,
    Box,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Typography,
  } from '@mui/material';
  
  import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
  
  import { useState } from 'react';
  
  import {
    useMutation,
    useQuery,
    useQueryClient,
  } from '@tanstack/react-query';
  
  import {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
  } from '../api/notificationsApi';
  
  import { API_ORIGIN } from '../../../config';
  
  export default function NotificationsMenu() {
    const queryClient =
      useQueryClient();
  
    const [anchorEl, setAnchorEl] =
      useState(null);
  
    const notificationsQuery =
      useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
      });
  
    const unreadQuery =
      useQuery({
        queryKey: [
          'notification-unread-count',
        ],
        queryFn: getUnreadCount,
      });
  
    const readMutation =
      useMutation({
        mutationFn:
          markNotificationAsRead,
  
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [
              'notifications',
            ],
          });
  
          queryClient.invalidateQueries({
            queryKey: [
              'notification-unread-count',
            ],
          });
        },
      });
  
    const open = Boolean(anchorEl);
  
    return (
      <>
        <IconButton
          onClick={(event) =>
            setAnchorEl(
              event.currentTarget
            )
          }
        >
          <Badge
            badgeContent={
              unreadQuery.data?.count ?? 0
            }
            color="error"
            max={99}
          >
            <NotificationsNoneRoundedIcon />
          </Badge>
        </IconButton>
  
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() =>
            setAnchorEl(null)
          }
          PaperProps={{
            sx: {
              width: 380,
              maxHeight: 520,
              mt: 1.5,
              borderRadius: 4,
              boxShadow:
                '0 24px 70px rgba(15,23,42,.16)',
            },
          }}
        >
          <Box
            sx={{
              px: 2.2,
              py: 1.7,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={900}
            >
              Notifications
            </Typography>
          </Box>
  
          <Divider />
  
          {notificationsQuery.data?.items
            ?.length === 0 && (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
              }}
            >
              <Typography color="text.secondary">
                No notifications yet.
              </Typography>
            </Box>
          )}
  
          {notificationsQuery.data?.items?.map(
            (notification) => {
              const avatar =
                notification.actorProfileImageUrl
                  ? notification.actorProfileImageUrl.startsWith(
                      'http'
                    )
                    ? notification.actorProfileImageUrl
                    : `${API_ORIGIN}${notification.actorProfileImageUrl}`
                  : null;
  
              return (
                <MenuItem
                  key={notification.id}
                  onClick={() => {
                    if (
                      !notification.isRead
                    ) {
                      readMutation.mutate(
                        notification.id
                      );
                    }
                  }}
                  sx={{
                    py: 1.5,
                    gap: 1.5,
                    alignItems:
                      'flex-start',
  
                    bgcolor:
                      notification.isRead
                        ? 'transparent'
                        : 'rgba(37,99,235,.06)',
                  }}
                >
                  <Avatar
                    src={avatar || undefined}
                  >
                    {
                      notification
                        .actorFirstName?.[0]
                    }
                  </Avatar>
  
                  <Box
                    sx={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace:
                          'normal',
                        fontWeight:
                          notification.isRead
                            ? 500
                            : 750,
                      }}
                    >
                      {
                        notification.message
                      }
                    </Typography>
  
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </Typography>
                  </Box>
  
                  {!notification.isRead && (
                    <Box
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor:
                          'primary.main',
                        mt: 1,
                      }}
                    />
                  )}
                </MenuItem>
              );
            }
          )}
        </Menu>
      </>
    );
  }