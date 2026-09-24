import {
    Avatar,
    Badge,
    Box,
    Typography,
  } from '@mui/material';

  import { API_ORIGIN }
    from '../../../config';

  export default function ConversationItem({
    conversation,
    selected,
    onClick,
  }) {
    const avatar =
      conversation.profileImageUrl
        ? conversation
            .profileImageUrl
            .startsWith('http')
          ? conversation
              .profileImageUrl
          : `${API_ORIGIN}${conversation.profileImageUrl}`
        : null;

    return (
      <Box
        onClick={onClick}
        sx={{
          p: 1.4,

          display: 'flex',

          gap: 1.2,

          alignItems:
            'center',

          borderRadius: 3,

          cursor: 'pointer',

          bgcolor: selected
            ? 'rgba(37,99,235,.08)'
            : 'transparent',

          '&:hover': {
            bgcolor:
              selected
                ? 'rgba(37,99,235,.1)'
                : 'rgba(15,23,42,.035)',
          },
        }}
      >
        <Box
          sx={{
            position:
              'relative',
          }}
        >
          <Avatar
            src={avatar || undefined}
            sx={{
              width: 50,
              height: 50,
              fontWeight: 800,
            }}
          >
            {
              conversation
                .firstName?.[0]
            }
          </Avatar>

          {conversation.isOnline && (
            <Box
              sx={{
                position:
                  'absolute',

                right: 1,
                bottom: 1,

                width: 13,
                height: 13,

                borderRadius:
                  '50%',

                bgcolor:
                  '#22c55e',

                border:
                  '3px solid white',
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={
              conversation
                .unreadCount > 0
                ? 850
                : 700
            }
            noWrap
          >
            {
              conversation
                .firstName
            }{' '}
            {
              conversation
                .lastName
            }
          </Typography>

          <Typography
            variant="caption"
            color={
              conversation
                .unreadCount > 0
                ? 'text.primary'
                : 'text.secondary'
            }
            fontWeight={
              conversation
                .unreadCount > 0
                ? 700
                : 400
            }
            noWrap
            sx={{
              display:
                'block',
            }}
          >
            {conversation.lastMessage ??
              'Start a conversation'}
          </Typography>
        </Box>

        {conversation.unreadCount >
          0 && (
          <Badge
            badgeContent={
              conversation.unreadCount
            }
            color="primary"
            max={99}
          />
        )}
      </Box>
    );
  }