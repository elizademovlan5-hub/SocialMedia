import {
  Avatar,
  Box,
  Button,
  Paper,
  Typography,
} from '@mui/material';

import { API_ORIGIN } from '../../../config';

export default function FriendRequestCard({
  request,
  onAccept,
  onReject,
  loading,
}) {
  const avatar =
    request.senderProfileImageUrl
      ? request.senderProfileImageUrl.startsWith(
          'http'
        )
        ? request.senderProfileImageUrl
        : `${API_ORIGIN}${request.senderProfileImageUrl}`
      : null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        <Avatar
          src={avatar || undefined}
          sx={{
            width: 52,
            height: 52,
          }}
        >
          {request.senderFirstName?.[0]}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={800}>
            {request.senderFirstName}{' '}
            {request.senderLastName}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            @{request.senderUserName}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mt: 2,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          disabled={loading}
          onClick={() =>
            onAccept(request.id)
          }
          sx={{
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 800,
          }}
        >
          Confirm
        </Button>

        <Button
          fullWidth
          variant="outlined"
          disabled={loading}
          onClick={() =>
            onReject(request.id)
          }
          sx={{
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 800,
          }}
        >
          Delete
        </Button>
      </Box>
    </Paper>
  );
}