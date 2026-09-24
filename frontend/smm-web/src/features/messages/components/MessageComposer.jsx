import { useState } from 'react';

import {
  Box,
  IconButton,
  InputBase,
  Paper,
} from '@mui/material';

import SendRoundedIcon
  from '@mui/icons-material/SendRounded';

export default function MessageComposer({
  onSend,
  disabled,
}) {
  const [content, setContent] =
    useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const value =
      content.trim();

    if (!value || disabled) {
      return;
    }

    onSend(value);

    setContent('');
  }

  return (
    <Box
      component="form"
      onSubmit={
        handleSubmit
      }
      sx={{
        p: 2,

        borderTop:
          '1px solid rgba(148,163,184,.15)',

        bgcolor:
          'rgba(255,255,255,.94)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',

          alignItems:
            'center',

          gap: 1,

          p: 0.7,

          pl: 1.8,

          borderRadius: 999,

          bgcolor:
            '#f1f5f9',

          border:
            '1px solid rgba(148,163,184,.12)',
        }}
      >
        <InputBase
          fullWidth

          multiline

          maxRows={5}

          placeholder="Write a message..."

          value={content}

          onChange={(event) =>
            setContent(
              event.target.value
            )
          }

          onKeyDown={(event) => {
            if (
              event.key ===
                'Enter' &&
              !event.shiftKey
            ) {
              event
                .preventDefault();

              handleSubmit(
                event
              );
            }
          }}
        />

        <IconButton
          type="submit"

          disabled={
            !content.trim() ||
            disabled
          }

          sx={{
            width: 40,
            height: 40,

            bgcolor:
              'primary.main',

            color: 'white',

            '&:hover': {
              bgcolor:
                'primary.dark',
            },

            '&.Mui-disabled': {
              bgcolor:
                'rgba(37,99,235,.2)',

              color: 'white',
            },
          }}
        >
          <SendRoundedIcon
            fontSize="small"
          />
        </IconButton>
      </Paper>
    </Box>
  );
}