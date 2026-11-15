import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import DivisionLogin from './DivisionLogin';

// No real network calls: axios (production API) and the legacy api.js client are mocked.
jest.mock('axios', () => ({ __esModule: true, default: { post: jest.fn(), create: jest.fn(() => ({ post: jest.fn(), get: jest.fn() })) } }));
jest.mock('../utils/sounds', () => ({ playSound: jest.fn() }));

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/division/login']}>
      <Routes>
        <Route path="/division/login" element={<DivisionLogin />} />
        <Route path="/engineer/dashboard" element={<div>Engineer dashboard</div>} />
        <Route path="/admin/dashboard" element={<div>Admin dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );

const fillAndSubmit = async (username, password) => {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText('Username'), username);
  await user.type(screen.getByPlaceholderText('Password'), password);
  await user.click(screen.getByRole('button', { name: /sign in/i }));
};

beforeEach(() => {
  localStorage.clear();
  axios.post.mockReset();
  window.alert = jest.fn();
});

test('FE-09 a valid engineer login stores the session and opens the engineer dashboard', async () => {
  axios.post.mockResolvedValue({ data: { role: 'engineer', userId: 'u1', employeeId: 'enx', fullName: 'Eng', email: 'e@x', division: 'Kekirawa' } });
  renderLogin();
  await fillAndSubmit('enx', 'secret');
  expect(await screen.findByText('Engineer dashboard')).toBeInTheDocument();
  expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/auth/login'), { employeeId: 'enx', password: 'secret' });
  expect(localStorage.getItem('role')).toBe('engineer');
  expect(localStorage.getItem('userDivision')).toBe('Kekirawa');
});

test('FE-10 a clerk is routed to the Admin dashboard', async () => {
  axios.post.mockResolvedValue({ data: { role: 'clerk', userId: 'u2', employeeId: 'cl1', fullName: 'Clerk' } });
  renderLogin();
  await fillAndSubmit('cl1', 'secret');
  expect(await screen.findByText('Admin dashboard')).toBeInTheDocument();
});

test('FE-11 a Head Office role is refused on the Division gateway and no session is stored', async () => {
  axios.post.mockResolvedValue({ data: { role: 'headoffice_admin', userId: 'u3', employeeId: 'ho1', fullName: 'HO' } });
  renderLogin();
  await fillAndSubmit('ho1', 'secret');
  await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/not yet available/i)));
  expect(localStorage.getItem('userId')).toBeNull();
});

test.each([
  ['USER_NOT_FOUND', /No account found/],
  ['INVALID_PASSWORD', /Incorrect password/],
])('FE-12 server error %s is shown as a friendly message', async (code, message) => {
  axios.post.mockRejectedValue({ response: { data: { error: code } } });
  renderLogin();
  await fillAndSubmit('someone', 'bad');
  await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(message)));
  expect(localStorage.getItem('role')).toBeNull();
});
