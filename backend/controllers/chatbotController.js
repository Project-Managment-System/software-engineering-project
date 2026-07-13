const Project = require('../models/Project');
const User = require('../models/User');

// ─── Intent Detection ────────────────────────────────────────────────────────
const detectIntent = (message) => {
  const msg = message.toLowerCase();
  if (/\b(week|7 day|recent|last week|this week|progress)\b/.test(msg)) return 'weekly';
  if (/\b(summar|overview|report|total|all jobs|full report)\b/.test(msg)) return 'summary';
  if (/\b(idea|suggest|recommend|improve|tip|advice|insight)\b/.test(msg)) return 'ideas';
  if (/\b(pending|waiting|not start)\b/.test(msg)) return 'pending';
  if (/\b(ongoing|in progress|active|current)\b/.test(msg)) return 'ongoing';
  if (/\b(complet|done|finish|closed)\b/.test(msg)) return 'completed';
  if (/\b(reject|fail|cancel)\b/.test(msg)) return 'rejected';
  if (/\b(approv)\b/.test(msg)) return 'approved';
  if (/\b(team|staff|user|member|person|who)\b/.test(msg)) return 'team';
  if (/\b(allocation|budget|fund|amount|money|cost)\b/.test(msg)) return 'allocation';
  if (/\b(ministry|department|sector)\b/.test(msg)) return 'ministry';
  if (/\b(hello|hi|hey|greet|good)\b/.test(msg)) return 'greeting';
  if (/\b(help|what can|command|option)\b/.test(msg)) return 'help';
  return 'general';
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
  const users = await User.find({ division: { $regex: new RegExp(`^${division}$`, 'i') } }).select('-password');
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
    .map(p => ({ ...p._doc, allocNum: parseFloat(p.allocation) }))
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

    const intent = detectIntent(message);
    const projects = await Project.find({ division }).sort({ updatedAt: -1 });
    let response = '';

    switch (intent) {
      case 'greeting':
        response = `👋 **Hello! I'm CEMS AI Assistant.**\n\nI'm here to help you stay on top of your **${division} division** projects.\n\nHere's what I can do:\n• 📊 **Overall Summary** — Full division report\n• 📅 **Weekly Progress** — Last 7 days activity\n• 💡 **Recommendations** — Smart project insights\n• 🔍 **Status Filters** — Pending, Ongoing, Completed\n• 👥 **Team Report** — Division staff directory\n• 💰 **Allocation Report** — Budget breakdown\n• 🏛️ **Ministry Report** — Ministry distribution\n\nJust ask me anything about your division! 🚀`;
        break;
      case 'help':
        response = `🤖 **CEMS AI Assistant — Help Guide**\n\nHere are things you can ask me:\n\n` +
          `• *"Give me a summary"* → Full division overview\n` +
          `• *"Weekly progress"* → This week's activity\n` +
          `• *"Ideas or recommendations"* → Strategic suggestions\n` +
          `• *"Show pending projects"* → List pending items\n` +
          `• *"Ongoing projects"* → Current active work\n` +
          `• *"Completed projects"* → Finished jobs\n` +
          `• *"Team report"* → Division staff\n` +
          `• *"Allocation report"* → Budget data\n` +
          `• *"Ministry report"* → Ministry breakdown`;
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
      default:
        response = `🤔 I'm not sure how to answer *"${message}"* yet.\n\nTry asking me:\n• **"Summary"** — Division overview\n• **"Weekly progress"** — Recent activity\n• **"Give me ideas"** — Recommendations\n• **"Show pending"** — Pending projects\n\nOr type **"help"** to see all available commands.`;
    }

    res.json({ response, intent });
  } catch (err) {
    console.error('[CHATBOT ERROR]:', err.message);
    res.status(500).json({ error: 'Chatbot encountered an error. Please try again.' });
  }
};
