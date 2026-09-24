import { useState } from 'react';

import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';

import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createComment,
  deleteComment,
  getComments,
} from '../api/commentsApi';

import { useAuthStore } from '../../auth/store/authStore';
import { API_ORIGIN } from '../../../config';

export default function CommentSection({
  postId,
}) {

  const queryClient = useQueryClient();

  const user = useAuthStore(
    (state) => state.user
  );

  const [content, setContent] = useState('');

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ['comments', postId],

    queryFn: () =>
      getComments(postId, {
        page: 1,
        pageSize: 20,
      }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createComment(
        postId,
        content.trim()
      ),

    onSuccess: () => {
      setContent('');

      queryClient.invalidateQueries({
        queryKey: [
          'comments',
          postId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ['posts'],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId) =>
      deleteComment(
        postId,
        commentId
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'comments',
          postId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ['posts'],
      });
    },
  });

  function handleSubmit(event) {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    createMutation.mutate();
  }

  return (
    <Box
      sx={{
        px: 2.5,
        pb: 2.3,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mt: 1.5,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          {user?.firstName?.[0]}
        </Avatar>

        <TextField
          fullWidth
          size="small"
          value={content}
          onChange={(event) =>
            setContent(
              event.target.value
            )
          }
          placeholder="Write a comment..."
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 999,
              bgcolor:
                'rgba(241,245,249,.8)',
            },
          }}
        />

        <IconButton
          type="submit"
          disabled={
            !content.trim() ||
            createMutation.isPending
          }
          color="primary"
        >
          {createMutation.isPending ? (
            <CircularProgress
              size={20}
            />
          ) : (
            <SendRoundedIcon />
          )}
        </IconButton>
      </Box>

      {isLoading && (
        <Typography
          variant="body2"
          color="text.secondary"
          mt={2}
        >
          Loading comments...
        </Typography>
      )}

      <Box sx={{ mt: 2 }}>
        {data?.items?.map(
          (comment) => {
            const avatarUrl =
              comment.profileImageUrl
                ? comment.profileImageUrl.startsWith(
                    'http'
                  )
                  ? comment.profileImageUrl
                  : `${API_ORIGIN}${comment.profileImageUrl}`
                : null;

            return (
              <Box
                key={comment.id}
                sx={{
                  display: 'flex',
                  gap: 1,
                  mb: 1.6,
                }}
              >
                <Avatar
                  src={
                    avatarUrl ||
                    undefined
                  }
                  sx={{
                    width: 34,
                    height: 34,
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {comment.firstName?.[0]}
                </Avatar>

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems:
                        'flex-start',
                      gap: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor:
                          'rgba(241,245,249,.95)',
                        borderRadius: 3,
                        px: 1.4,
                        py: 1,
                        flex: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={800}
                      >
                        {
                          comment.firstName
                        }{' '}
                        {
                          comment.lastName
                        }
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.25,
                          lineHeight: 1.5,
                          wordBreak:
                            'break-word',
                        }}
                      >
                        {
                          comment.content
                        }
                      </Typography>
                    </Box>

                    {comment.isMine && (
                      <IconButton
                        size="small"
                        onClick={() =>
                          deleteMutation.mutate(
                            comment.id
                          )
                        }
                      >
                        <DeleteOutlineRoundedIcon
                          fontSize="small"
                        />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          }
        )}
      </Box>
    </Box>
  );
}