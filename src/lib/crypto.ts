import { startOfHour, startOfMonth } from 'date-fns';
import { hash } from 'next-basics';
import { v4, v5 } from 'uuid';

export function secret() {
  return hash(process.env.APP_SECRET || process.env.DATABASE_URL);
}

export function salt() {
  const ROTATING_SALT = hash(startOfMonth(new Date()).toUTCString());

  return hash(secret(), ROTATING_SALT);
}

export function visitSalt() {
  console.log(startOfHour(new Date()).toUTCString());
  const now: Date = new Date(); // Get the current date and time

  // Format the date to YYYY-MM-DD
  const year: number = now.getFullYear();
  const month: string = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day: string = String(now.getDate()).padStart(2, '0');

  // Format the hours and minutes
  const hours: string = String(now.getHours()).padStart(2, '0');
  const minutes: string = String(now.getMinutes()).padStart(2, '0');

  // Determine the start time based on the current minutes
  const startTime: string = (parseInt(minutes) < 30) ? '00' : '30'; // Use '00' for minutes < 30, '30' otherwise

  // Create the formatted string
  const formattedDate: string = `${year}-${month}-${day} ${hours}:${startTime}:00`;

  const ROTATING_SALT = hash(formattedDate);

  return hash(secret(), ROTATING_SALT);
}

export function uuid(...args: any) {
  if (!args.length) return v4();

  return v5(hash(...args, salt()), v5.DNS);
}
