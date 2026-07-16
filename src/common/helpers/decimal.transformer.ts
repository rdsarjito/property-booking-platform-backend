import { ValueTransformer } from 'typeorm';

export class DecimalTransformer implements ValueTransformer {
  to(data?: number | null): number | null {
    if (data === undefined || data === null) {
      return null;
    }
    return data;
  }

  from(data?: string | null): number | null {
    if (data === undefined || data === null) {
      return null;
    }
    return parseFloat(data);
  }
}
