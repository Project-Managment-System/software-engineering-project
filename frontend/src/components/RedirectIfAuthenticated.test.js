import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RedirectIfAuthenticated, { getDashboardPathForSession } from './RedirectIfAuthenticated';

const session = (values) => Object.entries(values).forEach(([k, v]) => localStorage.setItem(k, v));

beforeEach(() => localStorage.clear());

describe('FE-06 getDashboardPathForSession maps every role to its dashboard', () => {
  test.each([
    ['admin', undefined, '/admin/dashboard'],
    ['clerk', undefined, '/admin/dashboard'],
    ['engineer', undefined, '/engineer/dashboard'],
    ['user', undefined, '/user/dashboard'],
    ['division_assistant', undefined, '/divisional-assistant/dashboard'],
    ['headoffice_admin', undefined, '/headoffice/dashboard'],
    ['branch_engineer', 'design', '/design/engineer/dashboard'],
    ['branch_director', 'branch-c', '/branch-c/director/dashboard'],
  ])('%s → %s', (role, branch, expected) => {
    session({ userId: 'u1', role, ...(branch ? { userBranch: branch } : {}) });
    expect(getDashboardPathForSession()).toBe(expected);
  });

  test('no session, or a branch role without a branch, gives no path', () => {
    expect(getDashboardPathForSession()).toBeNull();
    session({ userId: 'u1', role: 'branch_engineer' });
    expect(getDashboardPathForSession()).toBeNull();
  });
});

const renderPublicPage = () =>
  render(
    <MemoryRouter initialEntries={['/division/login']}>
      <Routes>
        <Route path="/division/login" element={<RedirectIfAuthenticated><div>Login form</div></RedirectIfAuthenticated>} />
        <Route path="/engineer/dashboard" element={<div>Engineer dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );

test('FE-07 a signed-in user is sent from the login page to their dashboard', () => {
  session({ userId: 'u1', role: 'engineer' });
  renderPublicPage();
  expect(screen.getByText('Engineer dashboard')).toBeInTheDocument();
});

test('FE-08 a visitor without a session sees the login page', () => {
  renderPublicPage();
  expect(screen.getByText('Login form')).toBeInTheDocument();
});
