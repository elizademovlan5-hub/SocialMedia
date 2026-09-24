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

import { login } from '../features/auth/api/authApi';
import { useAuthStore } from '../features/auth/store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();

  const setAuth = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState({
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
      const result = await login(form);

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
      setError(
        err.response?.data?.message ||
          'Login failed.'
      );
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
            SMM
          </Typography>

          <Typography
            color="text.secondary"
            textAlign="center"
            mb={3}
          >
            Sign in to your account
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
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </Box>

          <Typography
            textAlign="center"
            mt={3}
          >
            Don't have an account?{' '}
            <Link to="/register">
              Register
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}