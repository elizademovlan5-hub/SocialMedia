import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import { register } from '../features/auth/api/authApi';
import { useAuthStore } from '../features/auth/store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();

  const setAuth = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const result = await register(form);

      setAuth({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: {
          userId: result.userId,
          userName: result.userName,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
        },
      });

      navigate('/');
    } catch (err) {
      const data = err.response?.data;

      if (data?.errors) {
        setError(data.errors.join(' '));
      } else {
        setError(
          data?.message ||
            'Registration failed.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            p: 4,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            mb={1}
          >
            Create Account
          </Typography>

          <Typography
            color="text.secondary"
            textAlign="center"
            mb={3}
          >
            Join SMM
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="First name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                label="Last name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Username"
              name="userName"
              value={form.userName}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              margin="normal"
              required
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading
                ? 'Creating account...'
                : 'Register'}
            </Button>
          </Box>

          <Typography
            textAlign="center"
            mt={3}
          >
            Already have an account?{' '}
            <Link to="/login">
              Login
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}