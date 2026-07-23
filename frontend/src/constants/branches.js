// The 5 Head Office branches. Rename `label` freely once the real branch names are known —
// `slug` drives routing/DB values and should stay stable.
export const BRANCHES = [
  { slug: 'design', label: 'Design' },
  { slug: 'branch-a', label: 'Branch A' },
  { slug: 'branch-b', label: 'Branch B' },
  { slug: 'branch-c', label: 'Branch C' },
  { slug: 'branch-d', label: 'Branch D' },
];

export const branchLabel = (slug) => BRANCHES.find((b) => b.slug === slug)?.label || slug;
