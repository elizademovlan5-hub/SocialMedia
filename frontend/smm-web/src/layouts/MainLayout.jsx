import { useState } from 'react';

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Container,
  Divider,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '../features/auth/store/authStore';

import {
  logout as logoutRequest,
} from '../features/auth/api/authApi';

import {
  getUnreadCount,
} from '../features/notifications/api/notificationsApi';

import {
  getMessageUnreadCount,
} from '../features/messages/api/messagesApi';

import { API_ORIGIN } from '../config';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profileAnchorEl, setProfileAnchorEl] =
    useState(null);

  const [search, setSearch] =
    useState('');

  const user = useAuthStore(
    (state) => state.user
  );

  const refreshToken = useAuthStore(
    (state) => state.refreshToken
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  const profileMenuOpen =
    Boolean(profileAnchorEl);

  const notificationUnreadQuery =
    useQuery({
      queryKey: [
        'notification-unread-count',
      ],

      queryFn: getUnreadCount,
    });

  const messageUnreadQuery =
    useQuery({
      queryKey: [
        'message-unread-count',
      ],

      queryFn: getMessageUnreadCount,
    });

  const profileImageUrl =
    user?.profileImageUrl
      ? user.profileImageUrl.startsWith(
          'http'
        )
        ? user.profileImageUrl
        : `${API_ORIGIN}${user.profileImageUrl}`
      : null;

  async function handleLogout() {
    try {
      if (refreshToken) {
        await logoutRequest(
          refreshToken
        );
      }
    } catch (error) {
      console.error(
        'Logout request failed:',
        error
      );
    } finally {
      logout();

      setProfileAnchorEl(null);

      navigate('/login', {
        replace: true,
      });
    }
  }

  function handleSearchSubmit(
    event
  ) {
    event.preventDefault();

    const value =
      search.trim();

    if (!value) {
      return;
    }

    navigate(
      `/friends?search=${encodeURIComponent(
        value
      )}`
    );
  }

  function isActive(path) {
    if (path === '/') {
      return (
        location.pathname === '/'
      );
    }

    return location.pathname.startsWith(
      path
    );
  }

  function renderNavItem({
    path,
    title,
    icon,
    badge = 0,
  }) {
    const active =
      isActive(path);

    return (
      <Tooltip
        title={title}
        arrow
      >
        <IconButton
          onClick={() =>
            navigate(path)
          }
          sx={{
            position:
              'relative',

            width: {
              xs: 44,
              sm: 48,
            },

            height: {
              xs: 44,
              sm: 48,
            },

            borderRadius: 3,

            color: active
              ? 'primary.main'
              : 'text.secondary',

            bgcolor: active
              ? 'rgba(37,99,235,.09)'
              : 'transparent',

            transition:
              'all .2s ease',

            '&:hover': {
              bgcolor:
                'rgba(37,99,235,.08)',

              color:
                'primary.main',

              transform:
                'translateY(-1px)',
            },

            '&::after': active
              ? {
                  content: '""',

                  position:
                    'absolute',

                  bottom: -13,

                  left: '50%',

                  transform:
                    'translateX(-50%)',

                  width: 24,

                  height: 3,

                  borderRadius: 999,

                  bgcolor:
                    'primary.main',
                }
              : {},
          }}
        >
          <Badge
            badgeContent={badge}
            color="error"
            max={99}
          >
            {icon}
          </Badge>
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',

        background:
          'linear-gradient(180deg,#f8fafc 0%,#f3f6fb 42%,#f8fafc 100%)',
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor:
            'rgba(255,255,255,.86)',

          color:
            'text.primary',

          backdropFilter:
            'blur(24px)',

          WebkitBackdropFilter:
            'blur(24px)',

          borderBottom:
            '1px solid rgba(148,163,184,.14)',

          boxShadow:
            '0 6px 30px rgba(15,23,42,.035)',

          zIndex: (theme) =>
            theme.zIndex.drawer +
            10,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              minHeight: {
                xs: 66,
                sm: 74,
              },

              display: 'grid',

              gridTemplateColumns: {
                xs:
                  'auto 1fr auto',

                lg:
                  '340px 1fr 340px',
              },

              alignItems:
                'center',

              gap: 2,
            }}
          >
            {/* LEFT */}

            <Box
              sx={{
                display: 'flex',

                alignItems:
                  'center',

                gap: 1.3,
              }}
            >
              <Box
                onClick={() =>
                  navigate('/')
                }
                sx={{
                  width: 44,
                  height: 44,

                  flexShrink: 0,

                  borderRadius: 3,

                  display:
                    'grid',

                  placeItems:
                    'center',

                  cursor:
                    'pointer',

                  color: 'white',

                  fontSize: 20,

                  fontWeight: 950,

                  background:
                    'linear-gradient(135deg,#2563eb,#6366f1,#7c3aed)',

                  boxShadow:
                    '0 10px 28px rgba(37,99,235,.3)',
                }}
              >
                S
              </Box>

              <Paper
                component="form"
                onSubmit={
                  handleSearchSubmit
                }
                elevation={0}
                sx={{
                  display: {
                    xs: 'none',
                    md: 'flex',
                  },

                  alignItems:
                    'center',

                  px: 1.5,

                  width: 250,

                  height: 44,

                  borderRadius: 999,

                  bgcolor:
                    '#f1f5f9',
                }}
              >
                <SearchRoundedIcon
                  sx={{
                    mr: 1,

                    color:
                      'text.secondary',
                  }}
                />

                <InputBase
                  fullWidth
                  placeholder="Search SMM"
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                />
              </Paper>
            </Box>

            {/* CENTER */}

            <Box
              sx={{
                display: 'flex',

                justifyContent:
                  'center',

                gap: {
                  xs: 0,
                  sm: 0.8,
                  md: 1.6,
                },
              }}
            >
              {renderNavItem({
                path: '/',

                title: 'Home',

                icon: (
                  <HomeRoundedIcon />
                ),
              })}

              {renderNavItem({
                path: '/friends',

                title: 'Friends',

                icon: (
                  <PeopleAltRoundedIcon />
                ),
              })}

              {renderNavItem({
                path: '/messages',

                title:
                  'Messages',

                badge:
                  messageUnreadQuery
                    .data
                    ?.count ?? 0,

                icon: (
                  <ChatBubbleRoundedIcon />
                ),
              })}

              {renderNavItem({
                path:
                  '/notifications',

                title:
                  'Notifications',

                badge:
                  notificationUnreadQuery
                    .data
                    ?.count ?? 0,

                icon: (
                  <NotificationsRoundedIcon />
                ),
              })}
            </Box>

            {/* RIGHT */}

            <Box
              sx={{
                display: 'flex',

                justifyContent:
                  'flex-end',

                alignItems:
                  'center',
              }}
            >
              <Box
                onClick={(event) =>
                  setProfileAnchorEl(
                    event.currentTarget
                  )
                }
                sx={{
                  display: 'flex',

                  alignItems:
                    'center',

                  gap: 1,

                  py: 0.4,
                  px: 0.7,

                  borderRadius: 999,

                  cursor:
                    'pointer',

                  '&:hover': {
                    bgcolor:
                      'rgba(15,23,42,.045)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: {
                      xs: 'none',
                      lg: 'block',
                    },

                    textAlign:
                      'right',
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={850}
                  >
                    {
                      user?.firstName
                    }{' '}
                    {
                      user?.lastName
                    }
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    @{user?.userName}
                  </Typography>
                </Box>

                <Avatar
                  src={
                    profileImageUrl ||
                    undefined
                  }
                  sx={{
                    width: 42,
                    height: 42,

                    fontWeight: 850,

                    background:
                      'linear-gradient(135deg,#2563eb,#7c3aed)',
                  }}
                >
                  {
                    user?.firstName?.[0]
                  }
                </Avatar>

                <KeyboardArrowDownRoundedIcon
                  sx={{
                    display: {
                      xs: 'none',
                      sm: 'block',
                    },

                    color:
                      'text.secondary',

                    transform:
                      profileMenuOpen
                        ? 'rotate(180deg)'
                        : 'rotate(0)',

                    transition:
                      '.2s',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </AppBar>

      <Menu
        anchorEl={profileAnchorEl}
        open={profileMenuOpen}
        onClose={() =>
          setProfileAnchorEl(null)
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.2,

              width: 280,

              borderRadius: 4,

              border:
                '1px solid rgba(148,163,184,.14)',

              boxShadow:
                '0 24px 70px rgba(15,23,42,.16)',
            },
          },
        }}
      >
        <Box
          sx={{
            p: 2,

            display: 'flex',

            gap: 1.2,

            alignItems:
              'center',
          }}
        >
          <Avatar
            src={
              profileImageUrl ||
              undefined
            }
            sx={{
              width: 48,
              height: 48,

              fontWeight: 850,

              background:
                'linear-gradient(135deg,#2563eb,#7c3aed)',
            }}
          >
            {user?.firstName?.[0]}
          </Avatar>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              fontWeight={850}
              noWrap
            >
              {
                user?.firstName
              }{' '}
              {
                user?.lastName
              }
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
            >
              @{user?.userName}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => {
            setProfileAnchorEl(
              null
            );

            navigate(
              `/profile/${user?.userName}`
            );
          }}
          sx={{
            gap: 1.2,
            py: 1.3,
          }}
        >
          <PersonRoundedIcon />

          My profile
        </MenuItem>

        <MenuItem
          onClick={() => {
            setProfileAnchorEl(
              null
            );

            navigate(
              '/settings'
            );
          }}
          sx={{
            gap: 1.2,
            py: 1.3,
          }}
        >
          <SettingsRoundedIcon />

          Settings
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={
            handleLogout
          }
          sx={{
            gap: 1.2,

            py: 1.3,

            color:
              'error.main',

            '&:hover': {
              bgcolor:
                'rgba(239,68,68,.06)',
            },
          }}
        >
          <LogoutRoundedIcon />

          <Typography
            fontWeight={800}
          >
            Log out
          </Typography>
        </MenuItem>
      </Menu>

      <Box
        component="main"
        sx={{
          minHeight:
            'calc(100vh - 74px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}