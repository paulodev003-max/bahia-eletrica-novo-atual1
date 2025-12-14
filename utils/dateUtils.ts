export const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const subDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
};

export const format = (date: Date, fmt: string, options?: any) => {
  if (fmt === 'yyyy-MM-dd') {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (fmt === 'HH:mm') {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
  if (fmt === 'MMMM yyyy') {
    const m = date.toLocaleString('pt-BR', { month: 'long' });
    return `${m.charAt(0).toUpperCase() + m.slice(1)} ${date.getFullYear()}`;
  }
  if (fmt === "dd 'de' MMMM") {
    const d = date.getDate();
    const m = date.toLocaleString('pt-BR', { month: 'long' });
    return `${d} de ${m}`;
  }
  if (fmt === 'd') {
    return date.getDate().toString();
  }
  if (fmt === 'dd/MM/yyyy') {
    return date.toLocaleDateString('pt-BR');
  }
  if (fmt === 'dd/MM') {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
  return date.toISOString().split('T')[0];
};

export const parseISO = (str: string) => {
  if (!str) return new Date();
  if (str.length === 10 && str.includes('-')) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(str);
};

export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
export const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

export const subMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
};

export const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

export const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();
export const isToday = (d: Date) => isSameDay(d, new Date());
export const getDay = (d: Date) => d.getDay();

export const eachDayOfInterval = ({ start, end }: { start: Date, end: Date }) => {
  const days = [];
  let current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endT = new Date(end);
  endT.setHours(23, 59, 59, 999);
  while (current <= endT) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};
