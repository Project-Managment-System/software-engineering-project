import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, Eye, Trash2, Archive, ArchiveRestore, CheckCircle2,
  X, ChevronLeft, ChevronRight, Inbox, ArrowLeft
} from 'lucide-react';
import { inferNotificationMeta, PRIORITY_META, notificationTimestamp } from '../utils/notifications';

const PAGE_SIZE = 6;
const DATE_CUTOFFS = { today: 864e5, week: 7 * 864e5, month: 30 * 864e5 };

const cardVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.2 } },
};

// Shared, self-contained notification center — used today by the User and Admin dashboards.
// Fully controlled: the parent owns the `notifications` array and localStorage persistence;
// this component only renders it and calls back up for every action.
export default function NotificationCenter({
  notifications,
  loading = false,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onArchive,
  onUnarchive,
  onView,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // active | unread | read | archived
  const [dateFilter, setDateFilter] = useState('all'); // all | today | week | month
  const [page, setPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const enriched = useMemo(
    () => notifications.map((n) => ({ ...n, ...inferNotificationMeta(n) })),
    [notifications]
  );

  const filtered = useMemo(() => {
    let list = enriched;
    if (statusFilter === 'archived') {
      list = list.filter((n) => n.archived);
    } else {
      list = list.filter((n) => !n.archived);
      if (statusFilter === 'unread') list = list.filter((n) => !n.read);
      if (statusFilter === 'read') list = list.filter((n) => n.read);
    }
    if (dateFilter !== 'all') {
      const now = Date.now();
      list = list.filter((n) => now - notificationTimestamp(n) <= DATE_CUTOFFS[dateFilter]);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (n) =>
          (n.title || '').toLowerCase().includes(q) ||
          (n.message || '').toLowerCase().includes(q) ||
          (n.jobNo || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [enriched, statusFilter, dateFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const unreadCount = enriched.filter((n) => !n.archived && !n.read).length;

  const resetToFirstPage = (fn) => (...args) => {
    setPage(1);
    fn(...args);
  };

  return (
    <div className="notif-center">
      <div className="notif-center-toolbar">
        <div className="notif-center-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select
          className="job-select-dropdown notif-center-filter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="active">All Active</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </select>

        <select
          className="job-select-dropdown notif-center-filter"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
        >
          <option value="all">Any Date</option>
          <option value="today">Today</option>
          <option value="week">Past 7 Days</option>
          <option value="month">Past 30 Days</option>
        </select>

        {unreadCount > 0 && (
          <button className="action-btn-pill secondary" onClick={onMarkAllRead}>
            <CheckCircle2 size={13} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="notif-center-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="notif-card notif-card-skeleton">
              <div className="ps-skeleton" style={{ width: 38, height: 38, borderRadius: 10 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="ps-skeleton" style={{ width: '40%', height: 12 }} />
                <div className="ps-skeleton" style={{ width: '80%', height: 10 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="notif-center-empty">
          <Inbox size={40} strokeWidth={1.4} />
          <span>
            {search || statusFilter !== 'active' || dateFilter !== 'all'
              ? 'No notifications match your filters.'
              : 'You have no notifications yet.'}
          </span>
        </div>
      ) : (
        <>
          <div className="notif-center-list">
            <AnimatePresence initial={false}>
              {pageItems.map((notif) => {
                const priority = PRIORITY_META[notif.priority] || PRIORITY_META.low;
                const isConfirming = confirmDeleteId === notif.id;
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    variants={cardVariant}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`notif-card ${notif.read ? '' : 'notif-card-unread'}`}
                  >
                    <div className="notif-card-icon">
                      <Bell size={16} />
                    </div>
                    <div className="notif-card-body">
                      <div className="notif-card-top-row">
                        <span className="notif-card-title">{notif.title}</span>
                        <span className={`status-badge ${priority.badgeClass}`}>{priority.label}</span>
                      </div>
                      <p className="notif-card-message">{notif.message}</p>
                      <div className="notif-card-meta-row">
                        <span className="notif-card-category">{notif.category}</span>
                        {notif.jobNo && <span className="notif-card-job">Job {notif.jobNo}</span>}
                        <span className="notif-card-time">{notif.time}</span>
                        {!notif.read && <span className="notif-card-unread-dot" title="Unread" />}
                      </div>
                    </div>

                    <div className="notif-card-actions">
                      {isConfirming ? (
                        <>
                          <button
                            className="reject-btn"
                            onClick={() => { onDelete(notif.id); setConfirmDeleteId(null); }}
                            title="Confirm delete"
                          >
                            <Trash2 size={14} /> Confirm
                          </button>
                          <button className="cancel-btn" onClick={() => setConfirmDeleteId(null)} title="Cancel">
                            <ArrowLeft size={14} /> Back
                          </button>
                        </>
                      ) : (
                        <>
                          {notif.jobNo && (
                            <button className="action-btn-pill primary" onClick={() => onView(notif)} title="View related job">
                              <Eye size={13} /> View
                            </button>
                          )}
                          {!notif.read && (
                            <button className="action-btn-pill secondary" onClick={() => onMarkRead(notif.id)} title="Mark as read">
                              <CheckCircle2 size={13} /> Mark Read
                            </button>
                          )}
                          {notif.archived ? (
                            <button className="action-btn-pill secondary" onClick={() => onUnarchive(notif.id)} title="Restore from archive">
                              <ArchiveRestore size={13} /> Unarchive
                            </button>
                          ) : (
                            <button className="action-btn-pill secondary" onClick={() => onArchive(notif.id)} title="Archive">
                              <Archive size={13} /> Archive
                            </button>
                          )}
                          <button className="action-btn-pill secondary" onClick={() => setConfirmDeleteId(notif.id)} title="Delete">
                            <X size={13} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="notif-center-pagination">
              <button
                className="cancel-btn"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span>Page {safePage} of {totalPages}</span>
              <button
                className="cancel-btn"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
