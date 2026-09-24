import { useState } from 'react';

import {
  Box,
  Container,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  acceptFriendRequest,
  cancelFriendRequest,
  getFriends,
  getIncomingRequests,
  rejectFriendRequest,
  searchUsers,
  sendFriendRequest,
} from '../features/friends/api/friendsApi';

import {
  openConversation,
} from '../features/messages/api/messagesApi';

import PeopleCard from '../features/friends/components/PeopleCard';

import FriendRequestCard from '../features/friends/components/FriendRequestCard';

export default function FriendsPage() {
  const queryClient =
    useQueryClient();

  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const initialSearch =
    searchParams.get(
      'search'
    ) ?? '';

  const [tab, setTab] =
    useState(0);

  const [search, setSearch] =
    useState(initialSearch);

  const peopleQuery =
    useQuery({
      queryKey: [
        'people',
        search,
      ],

      queryFn: () =>
        searchUsers(search),
    });

  const requestsQuery =
    useQuery({
      queryKey: [
        'friend-requests',
      ],

      queryFn:
        getIncomingRequests,
    });

  const friendsQuery =
    useQuery({
      queryKey: [
        'friends',
      ],

      queryFn:
        getFriends,
    });

  function invalidateFriendData() {
    queryClient.invalidateQueries({
      queryKey: ['people'],
    });

    queryClient.invalidateQueries({
      queryKey: [
        'friend-requests',
      ],
    });

    queryClient.invalidateQueries({
      queryKey: [
        'friends',
      ],
    });
  }

  const sendMutation =
    useMutation({
      mutationFn:
        sendFriendRequest,

      onSuccess:
        invalidateFriendData,
    });

  const cancelMutation =
    useMutation({
      mutationFn:
        cancelFriendRequest,

      onSuccess:
        invalidateFriendData,
    });

  const acceptMutation =
    useMutation({
      mutationFn:
        acceptFriendRequest,

      onSuccess:
        invalidateFriendData,
    });

  const rejectMutation =
    useMutation({
      mutationFn:
        rejectFriendRequest,

      onSuccess:
        invalidateFriendData,
    });

  const openChatMutation =
    useMutation({
      mutationFn:
        openConversation,

      onSuccess: (
        result
      ) => {
        navigate(
          `/messages?conversation=${result.conversationId}`
        );
      },
    });

  const loading =
    sendMutation.isPending ||
    cancelMutation.isPending ||
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    openChatMutation.isPending;

  return (
    <Box
      sx={{
        minHeight:
          'calc(100vh - 74px)',

        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box mb={3}>
          <Typography
            variant="h4"
            fontWeight={950}
          >
            Friends
          </Typography>

          <Typography
            color="text.secondary"
          >
            Discover people and manage your connections.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            mb: 3,

            px: 2,

            borderRadius: 4,

            border: '1px solid',

            borderColor:
              'rgba(148,163,184,.16)',
          }}
        >
          <Tabs
            value={tab}
            onChange={(
              _,
              value
            ) =>
              setTab(value)
            }
          >
            <Tab label="Discover" />

            <Tab
              label={`Requests (${requestsQuery.data?.length ?? 0})`}
            />

            <Tab
              label={`Friends (${friendsQuery.data?.length ?? 0})`}
            />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <>
            <TextField
              fullWidth
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search people..."
              sx={{
                mb: 3,

                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      999,

                    bgcolor:
                      'white',
                  },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box
              sx={{
                display: 'grid',

                gridTemplateColumns: {
                  xs: '1fr',

                  md:
                    'repeat(2,1fr)',
                },

                gap: 2,
              }}
            >
              {peopleQuery.data?.map(
                (user) => (
                  <PeopleCard
                    key={user.id}
                    user={user}
                    loading={loading}

                    onAdd={(id) =>
                      sendMutation.mutate(
                        id
                      )
                    }

                    onCancel={(
                      requestId
                    ) =>
                      cancelMutation.mutate(
                        requestId
                      )
                    }

                    onAccept={(
                      requestId
                    ) =>
                      acceptMutation.mutate(
                        requestId
                      )
                    }

                    onReject={(
                      requestId
                    ) =>
                      rejectMutation.mutate(
                        requestId
                      )
                    }

                    onMessage={(
                      userId
                    ) =>
                      openChatMutation.mutate(
                        userId
                      )
                    }
                  />
                )
              )}
            </Box>
          </>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            {requestsQuery.data?.map(
              (request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  loading={loading}

                  onAccept={(
                    id
                  ) =>
                    acceptMutation.mutate(
                      id
                    )
                  }

                  onReject={(
                    id
                  ) =>
                    rejectMutation.mutate(
                      id
                    )
                  }
                />
              )
            )}
          </Stack>
        )}

        {tab === 2 && (
          <Stack spacing={2}>
            {friendsQuery.data?.map(
              (friend) => (
                <PeopleCard
                  key={friend.id}

                  user={{
                    ...friend,

                    relationshipStatus:
                      'Friends',
                  }}

                  loading={loading}

                  onMessage={(
                    userId
                  ) =>
                    openChatMutation.mutate(
                      userId
                    )
                  }
                />
              )
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}