/**
 * Native date utilities to replace date-fns
 */

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function subMonths(date: Date, months: number): Date {
  return addMonths(date, -months);
}

/**
 * Format a date using Intl.DateTimeFormat
 * Supports common date-fns format patterns
 */
export function formatDate(date: Date, pattern: string): string {
  switch (pattern) {
    case 'yyyy-MM-dd':
      return date.toISOString().split('T')[0];
    case 'HH:mm':
      return date.toTimeString().slice(0, 5);
    case 'yyyy-MM':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    case 'MMM':
      return date.toLocaleDateString('en-US', { month: 'short' });
    case 'MMMM yyyy':
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    case 'MMM dd, yyyy':
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    case 'MMM dd, yyyy HH:mm':
      return `${date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} ${date.toTimeString().slice(0, 5)}`;
    default:
      return date.toLocaleDateString();
  }
}
