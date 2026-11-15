import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ProtectedRoute from './ProtectedRoute';

// The real axios calls the production API; every test here replaces it with a mock.
jest.mock('axios', () => ({ __esModule: true, default: { get: jest.fn() } }));

const renderGuard = (props = {}) =>
  render(
    <MemoryRouter initialEntries={['/engineer/dashboard']}>
      <Routes>
        <Route path="/" element={<div>Portal page</div>} />
        <Route
          path="/engineer/dashboard"
          element={<ProtectedRoute allowedRoles={['engineer']} {...props}><div>Engineer dashboard</div></ProtectedRoute>}
        />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  localStorage.clear();
  axios.get.mockReset();
});

test('FE-01 redirects to the portal when there is no session, without calling the API', async () => {
  renderGuard();
  expect(await screen.findByText('Portal page')).toBeInTheDocument();
  expect(axios.get).not.toHaveBeenCalled();
});

test('FE-02 renders the dashboard when the database confirms the role', async () => {
  localStorage.setItem('userId', 'u1');
  localStorage.setItem('role', 'engineer');
  axios.get.mockResolvedValue({ data: { role: 'engineer' } });
  renderGuard();
  expect(screen.getByText('Checking access...')).toBeInTheDocument();
  expect(await screen.findByText('Engineer dashboard')).toBeInTheDocument();
  expect(axios.get.mock.calls[0][0]).toContain('/api/users/u1');
});

test('FE-03 a role edited in localStorage is rejected after the database re-check', async () => {
  localStorage.setItem('userId', 'u2');
  localStorage.setItem('role', 'engineer'); // tampered value
  axios.get.mockResolvedValue({ data: { role: 'user' } }); // real role in the database
  renderGuard();
  expect(await screen.findByText('Portal page')).toBeInTheDocument();
  expect(localStorage.getItem('userId')).toBeNull(); // session cleared
});

test('FE-04 branch requirement is enforced', async () => {
  localStorage.setItem('userId', 'u3');
  localStorage.setItem('role', 'engineer');
  axios.get.mockResolvedValue({ data: { role: 'engineer', branch: 'branch-a' } });
  renderGuard({ requiredBranch: 'design' });
  expect(await screen.findByText('Portal page')).toBeInTheDocument();
});

test('FE-05 an unreachable server shows a message and keeps the session', async () => {
  localStorage.setItem('userId', 'u4');
  localStorage.setItem('role', 'engineer');
  axios.get.mockRejectedValue(new Error('Network Error')); // no err.response
  renderGuard();
  expect(await screen.findByText(/Couldn't reach the server/)).toBeInTheDocument();
  expect(localStorage.getItem('userId')).toBe('u4');
});
