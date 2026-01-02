const LOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getTodayString(): string {
  return formatDate(new Date());
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDisplayDate(dateString: string): string {
  const date = parseDate(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  });
}

export function formatFullDate(dateString: string): string {
  const date = parseDate(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getDayIndex(startDate: string, currentDate: string): number {
  // Ignore startDate, calculate absolute day of year for currentDate
  const current = parseDate(currentDate);
  const start = new Date(current.getFullYear(), 0, 1); // Jan 1st
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export function getStartOfYear(year: number = new Date().getFullYear()): Date {
  return new Date(year, 0, 1);
}

export function isEntryLocked(createdAt: number): boolean {
  const now = Date.now();
  return now - createdAt > LOCK_DURATION_MS;
}

export function getTimeUntilLock(createdAt: number): number {
  const lockTime = createdAt + LOCK_DURATION_MS;
  const remaining = lockTime - Date.now();
  return Math.max(0, remaining);
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Locked';
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isDateInFuture(dateString: string): boolean {
  const date = parseDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date > today;
}

export function isToday(dateString: string): boolean {
  return dateString === getTodayString();
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}
