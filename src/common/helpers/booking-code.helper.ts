import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

export class BookingCodeHelper {
  static generate(): string {
    const dateStr = format(new Date(), 'yyyyMMdd');
    const suffix = uuidv4().slice(0, 8).toUpperCase();
    return `BK-${dateStr}-${suffix}`;
  }
}
