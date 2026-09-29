// The 5 Head Office branches. Rename `label` freely once the real branch names are known —
// `slug` drives routing/DB values and should stay stable.
export const BRANCHES = [
  { slug: 'design', label: 'Design' },
  { slug: 'branch-a', label: 'Admin' },
  { slug: 'branch-b', label: 'Accounts' },
  { slug: 'branch-c', label: 'Works' },
  { slug: 'branch-d', label: 'Procurements' },
];

export const branchLabel = (slug) => BRANCHES.find((b) => b.slug === slug)?.label || slug;
