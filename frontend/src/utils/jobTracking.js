// Shared helpers for the "Job Tracking" feature — attaching who/what performed a job
// status transition, and turning the stored role code into a readable label.

// Attach to any PUT/POST body that should append an entry to the job's statusHistory
// timeline, e.g. axios.put(url, { ...fields, historyEvent: 'Approved by Engineer', historyActor: getHistoryActor() })
export const getHistoryActor = () => ({
  name: localStorage.getItem('fullName') || '',
  role: localStorage.getItem('role') || ''
});

const ROLE_LABELS = {
  admin: 'Admin',
  clerk: 'Clerk',
  engineer: 'Engineer',
  division_assistant: 'Divisional Assistant',
  user: 'User',
  headoffice_admin: 'Head Office',
  branch_engineer: 'Design Engineer',
  branch_director: 'Design Director'
};

export const formatRoleLabel = (role) => ROLE_LABELS[role] || role || '—';
