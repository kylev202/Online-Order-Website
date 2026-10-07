import { store } from '../config/store';

// store.hours is listed Monday first; Date.getDay() counts from Sunday.
const todaysHours = (now: Date) => store.hours[(now.getDay() + 6) % 7];

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** Today's remaining delivery times, every 15 minutes, starting at least 15 minutes from now. */
export function deliverySlots(now = new Date()): string[] {
  const { open, close } = todaysHours(now);
  if (!open || !close) return [];
  const soonest = Math.ceil((now.getHours() * 60 + now.getMinutes() + 15) / 15) * 15;
  const slots: string[] = [];
  for (let t = Math.max(toMinutes(open), soonest); t <= toMinutes(close) - 15; t += 15) slots.push(toTime(t));
  return slots;
}
