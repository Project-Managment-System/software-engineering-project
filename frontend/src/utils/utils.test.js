import { formatCurrency } from './formatCurrency';
import { inferNotificationMeta, notificationTimestamp } from './notifications';
import { getHistoryActor, formatRoleLabel } from './jobTracking';

describe('FE-17 formatCurrency', () => {
  test('formats with thousands separators and two decimals', () => {
    expect(formatCurrency(2000000.8)).toBe('2,000,000.80');
    expect(formatCurrency('2500000')).toBe('2,500,000.00');
  });
  test('returns a dash for empty or invalid values', () => {
    [null, undefined, '', 'abc'].forEach((v) => expect(formatCurrency(v)).toBe('—'));
  });
});

describe('FE-18 inferNotificationMeta', () => {
  test.each([
    [{ title: 'Job Rejected' }, 'Alerts', 'high'],
    [{ message: 'Estimate approved' }, 'Approvals', 'normal'],
    [{ title: 'Drawing received' }, 'Drawing Updates', 'normal'],
    [{ title: 'Final estimate submitted' }, 'Estimates', 'normal'],
    [{ title: 'Welcome' }, 'General', 'low'],
  ])('%o → %s / %s', (notif, category, priority) => {
    expect(inferNotificationMeta(notif)).toEqual({ category, priority });
  });
  test('recovers the creation time from the notification id', () => {
    expect(notificationTimestamp({ id: 1767225600000.42 })).toBe(1767225600000);
  });
});

describe('FE-19 job tracking helpers', () => {
  beforeEach(() => localStorage.clear());
  test('getHistoryActor reads the signed-in user from localStorage', () => {
    localStorage.setItem('fullName', 'Test Engineer');
    localStorage.setItem('role', 'engineer');
    expect(getHistoryActor()).toEqual({ name: 'Test Engineer', role: 'engineer' });
  });
  test('formatRoleLabel maps role codes to display labels', () => {
    expect(formatRoleLabel('division_assistant')).toBe('Divisional Assistant');
    expect(formatRoleLabel('branch_director')).toBe('Design Director');
    expect(formatRoleLabel('')).toBe('—');
  });
});
