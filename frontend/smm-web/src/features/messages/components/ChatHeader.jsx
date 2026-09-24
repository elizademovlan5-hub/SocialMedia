import {
    Avatar,
    Box,
    IconButton,
    Typography,
  } from '@mui/material';

  import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
  import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

  import { API_ORIGIN } from '../../../config';

  export default function ChatHeader({
    conversation,
    onBack,
  }) {
    if (!conversation) {
      return null;
    }

    const avatarUrl =
      conversation.profileImageUrl
        ? conversation.profileImageUrl.startsWith('http')
          ? conversation.profileImageUrl
          : `${API_ORIGIN}${conversation.profileImageUrl}`
        : null;

    function getStatusText() {
      if (conversation.isOnline) {
        return 'Online';
      }

      if (!conversation.lastSeenAt) {
        return 'Offline';
      }

      const date = new Date(
        conversation.lastSeenAt
      );

      return `Last seen ${date.toLocaleString()}`;
    }

    return (
      <Box
        sx={{
          minHeight: 74,

          px: {
            xs: 1.5,
            sm: 2.4,
          },

          display: 'flex',

          alignItems: 'center',

          gap: 1.2,

          borderBottom:
            '1px solid rgba(148,163,184,.15)',

          bgcolor:
            'rgba(255,255,255,.96)',

          backdropFilter:
            'blur(18px)',

          position: 'relative',

          zIndex: 2,
        }}
      >
        <IconButton
          onClick={onBack}
          sx={{
            display: {
              xs: 'inline-flex',
              md: 'none',
            },
          }}
        >
          <ArrowBackRoundedIcon />
        </IconButton>

        <Box
          sx={{
            position: 'relative',
          }}
        >
          <Avatar
            src={avatarUrl || undefined}
            sx={{
              width: 46,
              height: 46,

              fontWeight: 850,

              background:
                'linear-gradient(135deg,#2563eb,#7c3aed)',
            }}
          >
            {conversation.firstName?.[0]}
          </Avatar>

          {conversation.isOnline && (
            <Box
              sx={{
                position: 'absolute',

                right: 0,
                bottom: 0,

                width: 13,
                height: 13,

                borderRadius: '50%',

                bgcolor: '#22c55e',

                border: '3px solid white',
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
            fontWeight={850}
            noWrap
          >
            {conversation.firstName}{' '}
            {conversation.lastName}
          </Typography>

          <Typography
            variant="caption"
            color={
              conversation.isOnline
                ? '#16a34a'
                : 'text.secondary'
            }
            noWrap
          >
            {getStatusText()}
          </Typography>
        </Box>

        <IconButton>
          <MoreHorizRoundedIcon />
        </IconButton>
      </Box>
    );
  }