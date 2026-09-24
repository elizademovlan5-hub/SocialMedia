import { useRef, useState } from 'react';

import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { createPost } from '../api/postsApi';
import { useAuthStore } from '../../auth/store/authStore';

export default function CreatePostCard() {
  const user = useAuthStore(
    (state) => state.user
  );

  const queryClient = useQueryClient();

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [content, setContent] = useState('');

  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  const [videoPreview, setVideoPreview] =
    useState(null);

  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: createPost,

    onSuccess: () => {
      resetForm();

      queryClient.invalidateQueries({
        queryKey: ['posts'],
      });
    },

    onError: (error) => {
      setError(
        error.response?.data?.message ||
          'Post could not be created.'
      );
    },
  });

  function resetForm() {
    setContent('');
    setImage(null);
    setVideo(null);
    setError('');

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setImagePreview(null);
    setVideoPreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');

    const maxSize = 10 * 1024 * 1024;

    if (!file.type.startsWith('image/')) {
      setError(
        'Please select a valid image.'
      );

      return;
    }

    if (file.size > maxSize) {
      setError(
        'Image must be smaller than 10 MB.'
      );

      return;
    }

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideo(null);
    setVideoPreview(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(file);

    setImagePreview(
      URL.createObjectURL(file)
    );
  }

  function handleVideoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');

    const maxSize =
      150 * 1024 * 1024;

    if (!file.type.startsWith('video/')) {
      setError(
        'Please select a valid video.'
      );

      return;
    }

    if (file.size > maxSize) {
      setError(
        'Video must be smaller than 150 MB.'
      );

      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview(null);

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideo(file);

    setVideoPreview(
      URL.createObjectURL(file)
    );
  }

  function removeImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }

  function removeVideo() {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideo(null);
    setVideoPreview(null);

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  }

  function handleSubmit() {
    if (
      !content.trim() &&
      !image &&
      !video
    ) {
      return;
    }

    setError('');

    mutation.mutate({
      content,
      image,
      video,
    });
  }

  const hasContent =
    content.trim() ||
    image ||
    video;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        p: 2.5,

        borderRadius: 4,

        border: '1px solid',
        borderColor:
          'rgba(148,163,184,.18)',

        background:
          'linear-gradient(145deg, rgba(255,255,255,.98), rgba(248,250,252,.96))',

        boxShadow:
          '0 20px 50px rgba(15,23,42,.07)',

        overflow: 'hidden',

        '&::before': {
          content: '""',
          position: 'absolute',
          top: -80,
          right: -70,
          width: 180,
          height: 180,
          borderRadius: '50%',

          background:
            'radial-gradient(circle, rgba(59,130,246,.15), transparent 70%)',

          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-start',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,

            fontWeight: 800,

            background:
              'linear-gradient(135deg, #2563eb, #7c3aed)',

            boxShadow:
              '0 8px 20px rgba(37,99,235,.2)',
          }}
        >
          {user?.firstName?.[0]}
        </Avatar>

        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={8}
          placeholder={`What's on your mind, ${
            user?.firstName ?? ''
          }?`}
          value={content}
          onChange={(event) =>
            setContent(
              event.target.value
            )
          }
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor:
                'rgba(248,250,252,.8)',

              '& fieldset': {
                borderColor:
                  'rgba(148,163,184,.2)',
              },

              '&:hover fieldset': {
                borderColor:
                  'rgba(59,130,246,.35)',
              },

              '&.Mui-focused fieldset': {
                borderColor:
                  'primary.main',
              },
            },
          }}
        />
      </Box>

      {imagePreview && (
        <Box
          sx={{
            position: 'relative',
            mt: 2.2,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#000',
          }}
        >
          <Box
            component="img"
            src={imagePreview}
            alt="Post preview"
            sx={{
              width: '100%',
              maxHeight: 520,
              display: 'block',
              objectFit: 'cover',
            }}
          />

          <IconButton
            onClick={removeImage}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,

              bgcolor:
                'rgba(15,23,42,.72)',

              color: 'white',

              backdropFilter:
                'blur(10px)',

              '&:hover': {
                bgcolor:
                  'rgba(15,23,42,.88)',
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      )}

      {videoPreview && (
        <Box
          sx={{
            position: 'relative',
            mt: 2.2,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#000',
          }}
        >
          <Box
            component="video"
            src={videoPreview}
            controls
            sx={{
              width: '100%',
              maxHeight: 520,
              display: 'block',
              bgcolor: '#000',
            }}
          />

          <IconButton
            onClick={removeVideo}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,

              bgcolor:
                'rgba(15,23,42,.72)',

              color: 'white',

              backdropFilter:
                'blur(10px)',

              '&:hover': {
                bgcolor:
                  'rgba(15,23,42,.88)',
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            borderRadius: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      <input
        ref={imageInputRef}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleImageChange}
      />

      <input
        ref={videoInputRef}
        hidden
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleVideoChange}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
          }}
        >
          <Tooltip title="Add photo">
            <IconButton
              onClick={() =>
                imageInputRef.current?.click()
              }
              disabled={Boolean(video)}
              sx={{
                width: 42,
                height: 42,

                '&:hover': {
                  bgcolor:
                    'rgba(16,185,129,.1)',
                  color: '#10b981',
                },
              }}
            >
              <ImageOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Add video">
            <IconButton
              onClick={() =>
                videoInputRef.current?.click()
              }
              disabled={Boolean(image)}
              sx={{
                width: 42,
                height: 42,

                '&:hover': {
                  bgcolor:
                    'rgba(139,92,246,.1)',
                  color: '#8b5cf6',
                },
              }}
            >
              <VideoLibraryOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Feeling">
            <IconButton
              sx={{
                width: 42,
                height: 42,

                '&:hover': {
                  bgcolor:
                    'rgba(245,158,11,.1)',
                  color: '#f59e0b',
                },
              }}
            >
              <SentimentSatisfiedAltOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Button
          variant="contained"
          disableElevation
          disabled={
            !hasContent ||
            mutation.isPending
          }
          onClick={handleSubmit}
          endIcon={
            mutation.isPending ? null : (
              <SendRoundedIcon />
            )
          }
          sx={{
            minWidth: 115,
            height: 44,

            borderRadius: 999,

            px: 3,

            textTransform: 'none',

            fontWeight: 800,

            background:
              'linear-gradient(135deg, #2563eb, #6366f1)',

            boxShadow:
              '0 10px 26px rgba(37,99,235,.22)',

            '&:hover': {
              boxShadow:
                '0 12px 30px rgba(37,99,235,.32)',
            },
          }}
        >
          {mutation.isPending ? (
            <CircularProgress
              size={21}
              sx={{
                color: 'white',
              }}
            />
          ) : (
            'Post'
          )}
        </Button>
      </Box>

      {(image || video) && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mt: 1.4,
          }}
        >
          {image
            ? `${image.name} • ${(
                image.size /
                1024 /
                1024
              ).toFixed(2)} MB`
            : `${video.name} • ${(
                video.size /
                1024 /
                1024
              ).toFixed(2)} MB`}
        </Typography>
      )}
    </Paper>
  );
}