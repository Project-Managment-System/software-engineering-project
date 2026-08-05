const Project = require('../models/Project');
const User = require('../models/User');
const escapeRegex = require('../utils/escapeRegex');

// ─── Intent Detection ────────────────────────────────────────────────────────
// Ordered from most specific/narrow to most general — the first match wins, so
// conversational and precise-topic patterns are checked well before the broad,
// easily-shadowed ones (e.g. "who" in team, "good" in greeting).
const detectIntent = (message) => {
  const msg = message.toLowerCase();
  // NOTE: word-stem alternatives (e.g. "summar", "complet") deliberately drop the trailing
  // \b and use \w* instead, so they still match inflected forms like "summary"/"completed" —
  // a bare \bsummar\b can never match anything, since "summar" is never a complete word.
  if (/\b(thank\w*|thx|appreciate\w*)\b/.test(msg)) return 'thanks';
  if (/\b(bye|goodbye|farewell|see you|gtg|logging off)\b/.test(msg)) return 'bye';
  if (/\b(how are you|how's it going|hows it going|how're you)\b/.test(msg)) return 'howareyou';
  if (/\b(who are you|what are you|your name|about yourself)\b/.test(msg)) return 'identity';
  if (/\b(joke\w*|funny|make me laugh)\b/.test(msg)) return 'joke';
  if (/\b(what'?s the date|what is the date|the date today|today'?s date|current date|what day is it|what'?s the time|what is the time|current time|what time is it)\b/.test(msg)) return 'datetime';
  if (/\b(repair\w*|work type|new work|type of work)\b/.test(msg)) return 'worktype';
  if (/\b(expensive|cheapest|highest allocation|lowest allocation|biggest budget|smallest budget|most expensive|least expensive)\b/.test(msg)) return 'costextremes';
  if (/\b(turnaround|average time|completion time|how long does it take|how long to complete)\b/.test(msg)) return 'turnaround';
  if (/\b(ds division|grama niladhari|gn division|divisional secretariat)\b/.test(msg)) return 'dsdivision';
  if (/\b(source\w*|referred|origin of request)\b/.test(msg)) return 'source';
  if (/\bdepartment\w*\b/.test(msg)) return 'department';
  // Checked ahead of the generic "summary" intent below — "team report"/"allocation
  // report"/"ministry report" all contain the word "report", which summary also matches,
  // so the more specific topic must win before the generic one gets a chance to.
  if (/\b(team|staff|user\w*|member\w*|person\w*|who)\b/.test(msg)) return 'team';
  if (/\b(allocation\w*|budget\w*|fund\w*|amount|money|cost)\b/.test(msg)) return 'allocation';
  if (/\b(ministry|ministries|sector\w*)\b/.test(msg)) return 'ministry';
  if (/\b(overdue|delay\w*|stuck|behind|stalled|late)\b/.test(msg)) return 'overdue';
  if (/\b(trend\w*|compar\w*|growth|history|over time|month\w*)\b/.test(msg)) return 'trend';
  if (/\b(week\w*|7 day|recent|last week|this week|progress)\b/.test(msg)) return 'weekly';
  if (/\b(summar\w*|overview|report\w*|total|all jobs|full report)\b/.test(msg)) return 'summary';
  if (/\b(idea\w*|suggest\w*|recommend\w*|improve\w*|tip\w*|advice|insight\w*)\b/.test(msg)) return 'ideas';
  if (/\b(pending|waiting|not start\w*)\b/.test(msg)) return 'pending';
  if (/\b(ongoing|in progress|active|current)\b/.test(msg)) return 'ongoing';
  if (/\b(complet\w*|done|finish\w*|closed)\b/.test(msg)) return 'completed';
  if (/\b(reject\w*|fail\w*|cancel\w*)\b/.test(msg)) return 'rejected';
  if (/\bapprov\w*\b/.test(msg)) return 'approved';
  if (/\b(hello|hi|hey|greet\w*|good)\b/.test(msg)) return 'greeting';
  if (/\b(help|what can|command\w*|option\w*)\b/.test(msg)) return 'help';
  return 'general';
};

// ─── Direct Job Lookup ────────────────────────────────────────────────────────
// Lets the assistant answer with real single-project data whenever the message
// contains something that looks like a job number or a meaningful job-name word,
// instead of forcing every query through the fixed intent list above.
const findJobMatches = (projects, message) => {
  const tokens = message.trim().toLowerCase().split(/\s+/).map(t => t.replace(/[^a-z0-9-]/g, '')).filter(Boolean);
  if (tokens.length === 0) return [];

  const idTokens = tokens.filter(t => /\d/.test(t) && t.length >= 3);
  const nameTokens = tokens.filter(t => t.length >= 5);
  if (idTokens.length === 0 && nameTokens.length === 0) return [];

  const matches = projects.filter(p => {
    const jobNo = (p.jobNo || '').toLowerCase();
    const jobName = (p.jobName || '').toLowerCase();
    const idHit = idTokens.some(t => jobNo && (jobNo === t || jobNo.includes(t) || t.includes(jobNo)));
    const nameHit = nameTokens.some(t => jobName && jobName.includes(t));
    return idHit || nameHit;
  });

  return matches.length > 0 && matches.length <= 15 ? matches : [];
};

const generateJobDetail = (matches, division) => {
  if (matches.length === 1) {
    const p = matches[0];
    const requested = p.dateReq || p.createdAt;
    const days = requested ? Math.floor((Date.now() - new Date(requested)) / 86400000) : null;
    return `🔎 **Job Found — ${division} Division**\n\n` +
      `**[${p.jobNo}] ${p.jobName}**\n` +
      `• Status: **${p.status}**\n` +
      `• Ministry: ${p.ministry || 'N/A'}\n` +
      `• Department: ${p.department || 'N/A'}\n` +
      `• Allocation: ${p.allocation ? 'Rs. ' + parseFloat(p.allocation).toLocaleString() : 'N/A'}\n` +
      `• Requested: ${requested ? new Date(requested).toLocaleDateString() : 'N/A'}${days !== null ? ` (${days} day${days !== 1 ? 's' : ''} ago)` : ''}\n` +
      `• Last Updated: ${p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'N/A'}`;
  }
  return `🔎 **${matches.length} Matching Jobs — ${division} Division**\n\n` +
    matches.slice(0, 8).map((p, i) => `**${i + 1}. [${p.jobNo}] ${p.jobName}** — *${p.status}*`).join('\n') +
    (matches.length > 8 ? `\n\n*...and ${matches.length - 8} more*` : '') +
    `\n\nAsk me for one specific job number for full details.`;
};

// ─── Overdue / Trend Analysis ─────────────────────────────────────────────────
const generateOverdueReport = (projects, division) => {
  const THRESHOLD_DAYS = 14;
  const now = Date.now();
  const stale = projects
    .filter(p => p.status === 'Pending' || p.status === 'Ongoing')
    .map(p => ({ p, days: Math.floor((now - new Date(p.updatedAt || p.createdAt)) / 86400000) }))
    .filter(x => x.days >= THRESHOLD_DAYS)
    .sort((a, b) => b.days - a.days);

  if (stale.length === 0) {
    return `✅ **No Overdue Projects — ${division} Division**\n\nEvery pending or ongoing project has been touched within the last ${THRESHOLD_DAYS} days. Nice work staying on top of things!`;
  }

  return `⏰ **Overdue Projects — ${division} Division**\n\n` +
    `**${stale.length}** project${stale.length > 1 ? 's have' : ' has'} had no status update for ${THRESHOLD_DAYS}+ days:\n\n` +
    stale.slice(0, 8).map((x, i) =>
      `**${i + 1}. [${x.p.jobNo}] ${x.p.jobName}** — *${x.p.status}*\n   No update for **${x.days} days**`
    ).join('\n\n') +
    (stale.length > 8 ? `\n\n*...and ${stale.length - 8} more*` : '');
};

const generateTrendReport = (projects, division) => {
  if (projects.length === 0) return `📈 No project history is available yet for **${division}** division.`;

  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: d.toLocaleString('default', { month: 'short', year: '2-digit' }), y: d.getFullYear(), m: d.getMonth(), count: 0 });
  }
  projects.forEach(p => {
    const d = new Date(p.createdAt);
    const hit = months.find(x => x.y === d.getFullYear() && x.m === d.getMonth());
    if (hit) hit.count++;
  });

  const max = Math.max(...months.map(x => x.count), 1);
  const chart = months.map(x => `${x.key}: ${'#'.repeat(Math.round((x.count / max) * 12)) || '.'} (${x.count})`).join('\n');
  const total6mo = months.reduce((a, x) => a + x.count, 0);
  const trendDir = months[5].count >= months[0].count ? '📈 rising' : '📉 declining';

  return `📈 **6-Month Job Intake Trend — ${division} Division**\n\n\`\`\`\n${chart}\n\`\`\`\n\n` +
    `**${total6mo}** job${total6mo !== 1 ? 's' : ''} submitted over the last 6 months. Trend is currently **${trendDir}** compared to 6 months ago.`;
};

// ─── Work Type / Cost / Turnaround / DS Division / Source / Department Reports ─
const generateWorkTypeReport = (projects, division) => {
  if (projects.length === 0) return `No project data found for **${division}** division.`;
  const avgOf = (arr) => {
    const vals = arr.map(p => parseFloat(p.allocation) || 0).filter(v => v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };
  const newWork = projects.filter(p => p.work === 'N');
  const repairWork = projects.filter(p => p.work === 'R');

  return `🏗️ **Work Type Breakdown — ${division} Division**\n\n` +
    `• **New Construction (N):** ${newWork.length} project${newWork.length !== 1 ? 's' : ''}` +
    `${newWork.length ? ` · Avg Allocation: Rs. ${avgOf(newWork).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''}\n` +
    `• **Repair (R):** ${repairWork.length} project${repairWork.length !== 1 ? 's' : ''}` +
    `${repairWork.length ? ` · Avg Allocation: Rs. ${avgOf(repairWork).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''}\n\n` +
    `Total: **${projects.length}** project${projects.length !== 1 ? 's' : ''} tracked.`;
};

const generateCostExtremesReport = (projects, division) => {
  const withAlloc = projects.filter(p => parseFloat(p.allocation) > 0);
  if (withAlloc.length === 0) return `No allocation data found for **${division}** division to compare.`;

  const sorted = [...withAlloc].sort((a, b) => parseFloat(b.allocation) - parseFloat(a.allocation));
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  return `💵 **Cost Extremes — ${division} Division**\n\n` +
    `**Highest Allocation:**\n[${highest.jobNo}] ${highest.jobName} — **Rs. ${parseFloat(highest.allocation).toLocaleString()}**\n\n` +
    `**Lowest Allocation:**\n[${lowest.jobNo}] ${lowest.jobName} — **Rs. ${parseFloat(lowest.allocation).toLocaleString()}**`;
};

const generateTurnaroundReport = (projects, division) => {
  const completed = projects.filter(p => p.status === 'Completed' && p.dateReq && p.updatedAt);
  const days = completed
    .map(p => Math.floor((new Date(p.updatedAt) - new Date(p.dateReq)) / 86400000))
    .filter(d => d >= 0);

  if (days.length === 0) {
    return `📐 Not enough completed-project date data yet for **${division}** division to calculate a turnaround time.`;
  }

  const avg = (days.reduce((a, b) => a + b, 0) / days.length).toFixed(1);
  return `📐 **Turnaround Time — ${division} Division**\n\n` +
    `Based on **${days.length}** completed project${days.length !== 1 ? 's' : ''} with request-to-completion dates:\n` +
    `• Average: **${avg} days**\n` +
    `• Fastest: **${Math.min(...days)} days**\n` +
    `• Slowest: **${Math.max(...days)} days**`;
};

const generateGroupedReport = (projects, division, field, title, emoji, noDataLabel) => {
  const groups = {};
  projects.forEach(p => {
    const key = p[field] || 'Unspecified';
    if (p[field]) groups[key] = (groups[key] || 0) + 1;
  });
  if (Object.keys(groups).length === 0) return `No ${noDataLabel} data found for **${division}** division.`;

  const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
  return `${emoji} **${title} — ${division} Division**\n\n` +
    sorted.map(([g, c]) => `• **${g}** — ${c} project${c !== 1 ? 's' : ''}`).join('\n');
};

// ─── Conversational / Meta Responses ───────────────────────────────────────────
const CHATBOT_JOKES = [
  `Why did the civil engineer break up with the architect? Too many unresolved *load-bearing* issues. 🏗️😄`,
  `Why don't engineers ever get lost on site? They always know where True North is. 🧭`,
  `What did the beam say to the column? "I've got you supported." 😄`,
  `Why was the estimator always calm? Because they had everything under budget. 💰😄`,
];

const generateIdentity = (division) =>
  `🤖 I'm the **CEMS AI Assistant**, built into your Engineer Dashboard for the **${division} division**.\n\n` +
  `I'm not a general-purpose chatbot — everything I tell you is pulled live from your division's real project data: summaries, trends, overdue items, budgets, work-type and department breakdowns, team info, and direct job lookups.\n\n` +
  `Type **"help"** to see everything I can do.`;

const generateDateTime = () => {
  const now = new Date();
  return `🗓️ Right now it's **${now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**, **${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}** (server time).`;
};

// ─── Smart Fallback ────────────────────────────────────────────────────────────
// Fires when the message matches no fixed intent and no job lookup. Instead of a
// flat "I don't understand", it searches the division's real data for anything
// relevant, and only redirects the user when there is genuinely nothing to match.
const STOPWORDS = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'what', 'who', 'how', 'why', 'when', 'where', 'of', 'in', 'on', 'for', 'to', 'my', 'me', 'i', 'you', 'your', 'can', 'please', 'tell', 'show', 'give', 'about', 'it', 'this', 'that', 'and', 'with']);

const generateSmartFallback = (projects, division, message) => {
  const tokens = message.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length >= 3 && !STOPWORDS.has(t));

  if (tokens.length === 0 || projects.length === 0) {
    return `🤔 I couldn't quite understand that, or it's outside what I'm built to help with — I'm focused on your **${division} division's** project data, not general topics.\n\n` +
      `Try asking me:\n• **"Summary"** — Division overview\n• **"Weekly progress"** — Recent activity\n• **"Give me ideas"** — Recommendations\n• **"Show pending"** — Pending projects\n• A **job number or job name** — Direct lookup\n\nOr type **"help"** to see everything I can do.`;
  }

  const scored = projects
    .map(p => {
      const haystack = `${p.jobNo || ''} ${p.jobName || ''} ${p.ministry || ''} ${p.department || ''} ${p.status || ''}`.toLowerCase();
      const score = tokens.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0);
      return { p, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return `🤔 I couldn't find anything in **${division} division's** data matching *"${message}"*, and it looks outside what I'm built to help with.\n\n` +
      `I'm a project-data assistant — try asking about summaries, pending/ongoing/completed jobs, allocations, ministries, or a specific job number.\n\nType **"help"** for the full list.`;
  }

  return `🔍 **Closest Matches for** *"${message}"* **— ${division} Division**\n\n` +
    scored.slice(0, 5).map((x, i) => `**${i + 1}. [${x.p.jobNo}] ${x.p.jobName}** — *${x.p.status}*\n   Ministry: ${x.p.ministry || 'N/A'}`).join('\n\n') +
    `\n\nAsk me for a specific job number for full details, or type **"help"** for more commands.`;
};

// ─── Report Generators ───────────────────────────────────────────────────────
const generateSummary = (projects, division) => {
  const total = projects.length;
  if (total === 0) return `📊 **Division Summary — ${division}**\n\nNo projects found for this division yet.`;

  const byStatus = {};
  projects.forEach(p => {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
  });

  const allocations = projects
    .map(p => parseFloat(p.allocation) || 0)
    .filter(v => v > 0);
  const totalAlloc = allocations.reduce((a, b) => a + b, 0);
  const avgAlloc = allocations.length ? (totalAlloc / allocations.length).toFixed(2) : 'N/A';

  const ministries = {};
  projects.forEach(p => {
    if (p.ministry) ministries[p.ministry] = (ministries[p.ministry] || 0) + 1;
  });
  const topMinistry = Object.entries(ministries).sort((a, b) => b[1] - a[1])[0];

  const latestJob = projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  return `📊 **Division Summary Report — ${division}**\n\n` +
    `**Total Projects:** ${total}\n\n` +
    `**Status Breakdown:**\n` +
    Object.entries(byStatus).map(([s, c]) => `• ${s}: **${c}** (${((c/total)*100).toFixed(0)}%)`).join('\n') + '\n\n' +
    `**Allocation:**\n` +
    `• Total Allocated: **${allocations.length ? 'Rs. ' + totalAlloc.toLocaleString() : 'N/A'}**\n` +
    `• Average per Project: **${avgAlloc !== 'N/A' ? 'Rs. ' + parseFloat(avgAlloc).toLocaleString() : 'N/A'}**\n\n` +
    (topMinistry ? `**Top Ministry:** ${topMinistry[0]} (${topMinistry[1]} projects)\n\n` : '') +
    `**Most Recent Job:** ${latestJob.jobName} (${latestJob.jobNo}) — *${latestJob.status}*`;
};

const generateWeeklyProgress = (projects, division) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recent = projects.filter(p => new Date(p.updatedAt || p.createdAt) >= weekAgo);
  const newJobs = projects.filter(p => new Date(p.createdAt) >= weekAgo);
  const statusChanged = recent.filter(p => p.status !== 'Pending');

  if (recent.length === 0) {
    return `📅 **Weekly Progress Report — ${division}**\n\nNo project activity recorded in the last 7 days. All systems appear idle this week.`;
  }

  const byStatus = {};
  recent.forEach(p => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });

  return `📅 **Weekly Progress Report — ${division}**\n` +
    `*Period: Last 7 days (${weekAgo.toLocaleDateString()} – ${now.toLocaleDateString()})*\n\n` +
    `**Activity Summary:**\n` +
    `• Total Active Projects This Week: **${recent.length}**\n` +
    `• New Jobs Submitted: **${newJobs.length}**\n` +
    `• Status Updates Made: **${statusChanged.length}**\n\n` +
    `**Breakdown by Status:**\n` +
    Object.entries(byStatus).map(([s, c]) => `• ${s}: ${c} project${c > 1 ? 's' : ''}`).join('\n') + '\n\n' +
    `**Recently Updated Jobs:**\n` +
    recent.slice(0, 5).map(p =>
      `• [${p.jobNo}] **${p.jobName}** — *${p.status}* (${new Date(p.updatedAt || p.createdAt).toLocaleDateString()})`
    ).join('\n');
};

const generateIdeas = (projects, division) => {
  const total = projects.length;
  const pending = projects.filter(p => p.status === 'Pending').length;
  const ongoing = projects.filter(p => p.status === 'Ongoing').length;
  const completed = projects.filter(p => p.status === 'Completed').length;
  const rejected = projects.filter(p => p.status === 'Rejected').length;
  const pendingRatio = total ? ((pending / total) * 100).toFixed(0) : 0;

  const ideas = [];

  if (pending > 3) {
    ideas.push(`🔴 **Address Pending Backlogs**: You have **${pending} pending projects** (${pendingRatio}% of total). Consider reviewing and approving or rejecting stalled submissions to unblock the pipeline.`);
  }

  if (ongoing > 0 && completed === 0) {
    ideas.push(`🟡 **Complete Ongoing Work**: You have **${ongoing} ongoing projects** but no completions yet. Focus on closing at least one to build momentum and demonstrate progress.`);
  }

  if (rejected > 0) {
    ideas.push(`🔵 **Review Rejected Projects**: **${rejected} project${rejected > 1 ? 's were' : ' was'} rejected**. It may be worth revisiting these to understand the rejection reasons and re-submit with corrections if warranted.`);
  }

  if (completed > 2) {
    ideas.push(`🟢 **Leverage Completed Projects**: You have **${completed} completed jobs** — great work! Consider documenting lessons learned and sharing insights with your division team.`);
  }

  if (total > 10) {
    ideas.push(`📋 **Implement Priority Queuing**: With **${total} total projects**, it may be beneficial to assign priority levels (High/Medium/Low) to help the team focus on critical tasks first.`);
  }

  if (total < 3) {
    ideas.push(`📥 **Expand Division Pipeline**: Your division currently has only **${total} project${total !== 1 ? 's' : ''}**. Consider coordinating with Admin to bring in more assignments suited to your team's expertise.`);
  }

  ideas.push(`📊 **Regular Reporting**: Schedule a weekly 15-minute team check-in to review the dashboard data and align on priorities. Consistent monitoring reduces project slippage.`);
  ideas.push(`🤝 **Cross-Division Collaboration**: Reach out to other division engineers for shared best practices, especially for projects under similar ministries or departments.`);

  return `💡 **Strategic Recommendations — ${division} Division**\n\n` + ideas.join('\n\n');
};

const generateStatusFilter = (projects, status, division) => {
  const filtered = projects.filter(p => p.status === status);
  if (filtered.length === 0) {
    return `No **${status}** projects found in the **${division}** division right now.`;
  }
  const label = { Pending: '🕐', Ongoing: '🔧', Completed: '✅', Approved: '✅', Rejected: '❌' }[status] || '📁';
  return `${label} **${status} Projects — ${division} Division**\n\n` +
    `Total: **${filtered.length}**\n\n` +
    filtered.slice(0, 8).map((p, i) =>
      `**${i + 1}. [${p.jobNo}] ${p.jobName}**\n   Ministry: ${p.ministry || 'N/A'} · Dept: ${p.department || 'N/A'}\n   Allocation: ${p.allocation || 'N/A'} · Requested: ${p.dateReq ? new Date(p.dateReq).toLocaleDateString() : 'N/A'}`
    ).join('\n\n') +
    (filtered.length > 8 ? `\n\n*...and ${filtered.length - 8} more projects*` : '');
};

const generateTeamReport = async (division) => {
  const users = await User.find({ division: { $regex: new RegExp(`^${escapeRegex(division)}$`, 'i') } }).select('-password').lean();
  if (users.length === 0) return `👥 No team members found in the **${division}** division.`;

  const roleMap = { division_assistant: 'Division Assistant', user: 'Field User', clerk: 'Clerk', engineer: 'Engineer' };
  return `👥 **Team Directory — ${division} Division**\n\n` +
    `Total Members: **${users.length}**\n\n` +
    users.map((u, i) =>
      `**${i + 1}. ${u.fullName}**\n   Role: ${roleMap[u.role] || u.role} · ID: ${u.employeeId}\n   Email: ${u.email}`
    ).join('\n\n');
};

const generateAllocationReport = (projects, division) => {
  const withAlloc = projects.filter(p => parseFloat(p.allocation) > 0);
  if (withAlloc.length === 0) return `No allocation data found for **${division}** division.`;

  const sorted = withAlloc
    .map(p => ({ ...p, allocNum: parseFloat(p.allocation) }))
    .sort((a, b) => b.allocNum - a.allocNum);
  const total = sorted.reduce((acc, p) => acc + p.allocNum, 0);

  return `💰 **Allocation Report — ${division} Division**\n\n` +
    `Total Allocated Budget: **Rs. ${total.toLocaleString()}**\n` +
    `Projects with Allocation: **${sorted.length}**\n` +
    `Average: **Rs. ${(total / sorted.length).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}**\n\n` +
    `**Top Allocated Projects:**\n` +
    sorted.slice(0, 6).map((p, i) =>
      `${i + 1}. [${p.jobNo}] ${p.jobName} — **Rs. ${p.allocNum.toLocaleString()}**`
    ).join('\n');
};

const generateMinistryReport = (projects, division) => {
  const ministries = {};
  projects.forEach(p => {
    if (p.ministry) {
      if (!ministries[p.ministry]) ministries[p.ministry] = { count: 0, statuses: {} };
      ministries[p.ministry].count++;
      ministries[p.ministry].statuses[p.status] = (ministries[p.ministry].statuses[p.status] || 0) + 1;
    }
  });
  if (Object.keys(ministries).length === 0) return `No ministry data found for **${division}** division.`;

  const sorted = Object.entries(ministries).sort((a, b) => b[1].count - a[1].count);
  return `🏛️ **Ministry Distribution — ${division} Division**\n\n` +
    sorted.map(([m, data]) =>
      `**${m}** — ${data.count} project${data.count > 1 ? 's' : ''}\n` +
      Object.entries(data.statuses).map(([s, c]) => `  • ${s}: ${c}`).join('\n')
    ).join('\n\n');
};

// ─── Main Chatbot Controller ─────────────────────────────────────────────────
exports.handleChat = async (req, res) => {
  try {
    const { message, division } = req.body;
    if (!message || !division) {
      return res.status(400).json({ error: 'Message and division are required.' });
    }

    const projects = await Project.find({ division }).sort({ updatedAt: -1 }).lean();

    // A job number or job name in the message takes priority over generic intents —
    // it lets the assistant answer with one real project's data instead of a canned report.
    const jobMatches = findJobMatches(projects, message);
    if (jobMatches.length > 0) {
      return res.json({ response: generateJobDetail(jobMatches, division), intent: 'lookup' });
    }

    const intent = detectIntent(message);
    let response = '';

    switch (intent) {
      case 'greeting':
        response = `👋 **Hello! I'm CEMS AI Assistant.**\n\nI'm here to help you stay on top of your **${division} division** projects.\n\nHere's what I can do:\n• 📊 **Overall Summary** — Full division report\n• 📅 **Weekly Progress** — Last 7 days activity\n• 📈 **6-Month Trend** — Job intake over time\n• ⏰ **Overdue Check** — Stalled projects\n• 💡 **Recommendations** — Smart project insights\n• 🔍 **Status Filters** — Pending, Ongoing, Completed\n• 👥 **Team Report** — Division staff directory\n• 💰 **Allocation Report** — Budget breakdown\n• 🏛️ **Ministry Report** — Ministry distribution\n• 🔎 **Job Lookup** — Just type a job number or job name\n\nJust ask me anything about your division! 🚀`;
        break;
      case 'help':
        response = `🤖 **CEMS AI Assistant — Help Guide**\n\nHere are things you can ask me:\n\n` +
          `• *"Give me a summary"* → Full division overview\n` +
          `• *"Weekly progress"* → This week's activity\n` +
          `• *"6-month trend"* → Job intake trend chart\n` +
          `• *"Overdue projects"* → Projects with no recent activity\n` +
          `• *"Ideas or recommendations"* → Strategic suggestions\n` +
          `• *"Show pending projects"* → List pending items\n` +
          `• *"Ongoing projects"* → Current active work\n` +
          `• *"Completed projects"* → Finished jobs\n` +
          `• *"Team report"* → Division staff\n` +
          `• *"Allocation report"* → Budget data\n` +
          `• *"Ministry report"* → Ministry breakdown\n` +
          `• *A job number or job name* → Direct lookup for that project\n\n` +
          `Anything else you ask, I'll search your division's real project data for the closest match instead of just giving up.`;
        break;
      case 'summary':
        response = generateSummary(projects, division);
        break;
      case 'weekly':
        response = generateWeeklyProgress(projects, division);
        break;
      case 'ideas':
        response = generateIdeas(projects, division);
        break;
      case 'pending':
        response = generateStatusFilter(projects, 'Pending', division);
        break;
      case 'ongoing':
        response = generateStatusFilter(projects, 'Ongoing', division);
        break;
      case 'completed':
        response = generateStatusFilter(projects, 'Completed', division);
        break;
      case 'rejected':
        response = generateStatusFilter(projects, 'Rejected', division);
        break;
      case 'approved':
        response = generateStatusFilter(projects, 'Approved', division);
        break;
      case 'team':
        response = await generateTeamReport(division);
        break;
      case 'allocation':
        response = generateAllocationReport(projects, division);
        break;
      case 'ministry':
        response = generateMinistryReport(projects, division);
        break;
      case 'overdue':
        response = generateOverdueReport(projects, division);
        break;
      case 'trend':
        response = generateTrendReport(projects, division);
        break;
      case 'worktype':
        response = generateWorkTypeReport(projects, division);
        break;
      case 'costextremes':
        response = generateCostExtremesReport(projects, division);
        break;
      case 'turnaround':
        response = generateTurnaroundReport(projects, division);
        break;
      case 'dsdivision':
        response = generateGroupedReport(projects, division, 'dsDivision', 'DS Division Breakdown', '🗺️', 'DS Division');
        break;
      case 'source':
        response = generateGroupedReport(projects, division, 'source', 'Request Source Breakdown', '📥', 'source');
        break;
      case 'department':
        response = generateGroupedReport(projects, division, 'department', 'Department Distribution', '🏢', 'department');
        break;
      case 'thanks':
        response = `You're very welcome! Let me know if there's anything else about your division you'd like to check. 🙌`;
        break;
      case 'bye':
        response = `Goodbye! Come back anytime you need a project update. 👋`;
        break;
      case 'howareyou':
        response = `I'm running smoothly and ready to help! How can I assist you with your division's projects today? 😊`;
        break;
      case 'identity':
        response = generateIdentity(division);
        break;
      case 'joke':
        response = CHATBOT_JOKES[Math.floor(Math.random() * CHATBOT_JOKES.length)];
        break;
      case 'datetime':
        response = generateDateTime();
        break;
      default:
        response = generateSmartFallback(projects, division, message);
    }

    res.json({ response, intent });
  } catch (err) {
    console.error('[CHATBOT ERROR]:', err.message);
    res.status(500).json({ error: 'Chatbot encountered an error. Please try again.' });
  }
};
