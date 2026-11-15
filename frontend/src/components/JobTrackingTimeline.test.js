import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobTrackingTimeline from './JobTrackingTimeline';

const jobs = [
  {
    jobNo: 'JB-1001',
    estimationNo: '26-ANU E-612-N-01',
    jobName: 'Classroom block',
    statusHistory: [
      { event: 'Job created', by: 'Clerk One', byRole: 'clerk', at: '2026-07-01T04:00:00.000Z' },
      { event: 'Approved by Engineer', by: 'Eng One', byRole: 'engineer', at: '2026-07-03T04:00:00.000Z' },
    ],
  },
  { jobNo: 'JB-1002', estimationNo: '', jobName: 'Library roof', statusHistory: [] },
];

test('FE-13 shows an empty-state message when there are no jobs', () => {
  render(<JobTrackingTimeline jobs={[]} />);
  expect(screen.getByText('No jobs to track yet.')).toBeInTheDocument();
});

test('FE-14 lists jobs with their Estimation No. (or a dash when missing)', () => {
  render(<JobTrackingTimeline jobs={jobs} />);
  expect(screen.getByText('26-ANU E-612-N-01')).toBeInTheDocument();
  expect(screen.getByText('Library roof')).toBeInTheDocument();
  expect(screen.getByText('—')).toBeInTheDocument();
});

test('FE-15 selecting a job shows its history and the latest event as the current location', async () => {
  render(<JobTrackingTimeline jobs={jobs} />);
  await userEvent.setup().click(screen.getByText('Classroom block'));
  expect(screen.getByText(/Tracking: Classroom block/)).toBeInTheDocument();
  expect(screen.getByText('Current Location')).toBeInTheDocument();
  expect(screen.getAllByText('Approved by Engineer').length).toBeGreaterThanOrEqual(1);
  expect(screen.getByText('Job created')).toBeInTheDocument();
  expect(screen.getByText(/Eng One \(Engineer\) ·/)).toBeInTheDocument(); // actor, role label and timestamp
});

test('FE-16 a job without history shows the "no events" message', async () => {
  render(<JobTrackingTimeline jobs={jobs} />);
  await userEvent.setup().click(screen.getByText('Library roof'));
  expect(screen.getByText('No tracking events recorded yet.')).toBeInTheDocument();
});
