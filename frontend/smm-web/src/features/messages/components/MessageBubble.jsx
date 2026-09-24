import {
    Box,
    Typography,
  } from '@mui/material';

  import DoneAllRoundedIcon
    from '@mui/icons-material/DoneAllRounded';

  export default function MessageBubble({
    message,
    mine,
  }) {
    return (
      <Box
        sx={{
          display: 'flex',

          justifyContent:
            mine
              ? 'flex-end'
              : 'flex-start',

          mb: 1,
        }}
      >
        <Box
          sx={{
            maxWidth: '72%',

            px: 1.7,
            py: 1.1,

            borderRadius:
              mine
                ? '20px 20px 5px 20px'
                : '20px 20px 20px 5px',

            background: mine
              ? 'linear-gradient(135deg,#2563eb,#6366f1)'
              : '#eef2f7',

            color:
              mine
                ? 'white'
                : '#172033',

            boxShadow: mine
              ? '0 8px 20px rgba(37,99,235,.15)'
              : 'none',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace:
                'pre-wrap',

              wordBreak:
                'break-word',

              lineHeight: 1.55,

              fontSize: 14.5,
            }}
          >
            {message.content}
          </Typography>

          <Box
            sx={{
              mt: 0.4,

              display: 'flex',

              justifyContent:
                'flex-end',

              alignItems:
                'center',

              gap: 0.4,

              opacity: 0.75,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: 10,

                color: 'inherit',
              }}
            >
              {new Date(
                message.createdAt
              ).toLocaleTimeString(
                [],
                {
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}
            </Typography>

            {mine && (
              <DoneAllRoundedIcon
                sx={{
                  fontSize: 14,

                  color:
                    message.isRead
                      ? '#bfdbfe'
                      : 'inherit',
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    );
  }