export const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

export const calculateDateRange = (period: string): { startDate: string; endDate: string } => {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case 'day':
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      break;
  }
  const toISO = (d: Date) => d.toISOString().split('T')[0];
  return { startDate: toISO(start), endDate: toISO(end) };
};
