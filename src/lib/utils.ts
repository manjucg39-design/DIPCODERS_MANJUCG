import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

// ─── Class Merging ─────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Money Formatting ──────────────────────────────────────────────────────
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(rupees);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

// ─── Date / Time ───────────────────────────────────────────────────────────
// Always display in Asia/Kolkata (IST)
export function formatIST(utcIso: string, fmt = 'dd MMM yyyy, hh:mm a'): string {
  try {
    const date = parseISO(utcIso);
    // Shift to IST (+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    return format(istDate, fmt);
  } catch {
    return utcIso;
  }
}

export function timeAgo(utcIso: string): string {
  try {
    return formatDistanceToNow(parseISO(utcIso), { addSuffix: true });
  } catch {
    return '';
  }
}

export function formatDateOnly(utcIso: string): string {
  return formatIST(utcIso, 'dd MMM yyyy');
}

// ─── Status Helpers ────────────────────────────────────────────────────────

export function getFulfillmentBadge(status: string): {
  label: string;
  className: string;
} {
  const map: Record<string, { label: string; className: string }> = {
    REQUESTED:          { label: 'Requested',          className: 'badge-info' },
    AWAITING_WORKER:    { label: 'Finding Worker',     className: 'badge-warning' },
    WORKER_ASSIGNED:    { label: 'Worker Assigned',    className: 'badge-primary' },
    WORKER_ON_THE_WAY:  { label: 'Worker On The Way',  className: 'badge-primary' },
    INSPECTION:         { label: 'Inspection',         className: 'badge-warning' },
    QUOTATION_PENDING:  { label: 'Awaiting Quotation', className: 'badge-warning' },
    IN_PROGRESS:        { label: 'In Progress',        className: 'badge-primary' },
    COMPLETION_PENDING: { label: 'Completion Pending', className: 'badge-warning' },
    MUTUALLY_COMPLETED: { label: 'Completed',          className: 'badge-success' },
    CANCELLED:          { label: 'Cancelled',          className: 'badge-error' },
  };
  return map[status] ?? { label: status, className: 'badge-neutral' };
}

export function getPaymentBadge(status: string): {
  label: string;
  className: string;
} {
  const map: Record<string, { label: string; className: string }> = {
    CREATED:  { label: 'Payment Created',  className: 'badge-neutral' },
    PENDING:  { label: 'Payment Pending',  className: 'badge-warning' },
    CAPTURED: { label: 'Payment Captured', className: 'badge-success' },
    FAILED:   { label: 'Payment Failed',   className: 'badge-error' },
  };
  return map[status] ?? { label: status, className: 'badge-neutral' };
}

export function getQuotationDecisionBadge(decision: string): {
  label: string;
  className: string;
} {
  const map: Record<string, { label: string; className: string }> = {
    PENDING:    { label: 'Awaiting Decision', className: 'badge-warning' },
    ACCEPTED:   { label: 'Accepted',          className: 'badge-success' },
    REJECTED:   { label: 'Rejected',          className: 'badge-error' },
    SUPERSEDED: { label: 'Superseded',        className: 'badge-neutral' },
    EXPIRED:    { label: 'Expired',           className: 'badge-neutral' },
  };
  return map[decision] ?? { label: decision, className: 'badge-neutral' };
}

export function getDisputeBadge(status: string): {
  label: string;
  className: string;
} {
  const map: Record<string, { label: string; className: string }> = {
    OPEN:         { label: 'Open',         className: 'badge-error' },
    UNDER_REVIEW: { label: 'Under Review', className: 'badge-warning' },
    RESOLVED:     { label: 'Resolved',     className: 'badge-success' },
    CLOSED:       { label: 'Closed',       className: 'badge-neutral' },
  };
  return map[status] ?? { label: status, className: 'badge-neutral' };
}

export function getRefundBadge(status: string): {
  label: string;
  className: string;
} {
  const map: Record<string, { label: string; className: string }> = {
    REQUESTED:    { label: 'Requested',    className: 'badge-info' },
    UNDER_REVIEW: { label: 'Under Review', className: 'badge-warning' },
    APPROVED:     { label: 'Approved',     className: 'badge-primary' },
    SUBMITTED:    { label: 'Submitted',    className: 'badge-primary' },
    SUCCEEDED:    { label: 'Refunded',     className: 'badge-success' },
    FAILED:       { label: 'Failed',       className: 'badge-error' },
  };
  return map[status] ?? { label: status, className: 'badge-neutral' };
}

// ─── Validation ────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Indian mobile: 10 digits, starts with 6-9
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

// ─── Text Helpers ──────────────────────────────────────────────────────────

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

// ─── Rating ────────────────────────────────────────────────────────────────

export function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ─── Error Handling ────────────────────────────────────────────────────────

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>;
    if (typeof e.message === 'string') return e.message;
    if (typeof e.detail === 'string') return e.detail;
  }
  return 'An unexpected error occurred.';
}

// ─── Environment ───────────────────────────────────────────────────────────

export const IS_DEV = import.meta.env.DEV;
export const IS_MOCK_PAYMENT = import.meta.env.VITE_MOCK_PAYMENTS === 'true' && IS_DEV;
export const APP_NAME = 'KaamWala';
export const APP_TAGLINE = 'Trusted Local Services in Mysuru';
