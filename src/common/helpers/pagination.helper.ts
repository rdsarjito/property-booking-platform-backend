export interface OffsetPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CursorPaginationMeta {
  limit: number;
  nextCursor: string | null;
  hasNextPage: boolean;
}

export class PaginationHelper {
  static buildOffsetMeta(total: number, page: number, limit: number): OffsetPaginationMeta {
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
    return {
      total,
      page,
      limit,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }

  static encodeCursor(id: number): string {
    return Buffer.from(id.toString()).toString('base64');
  }

  static decodeCursor(cursor: string): number | null {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('ascii');
      const id = parseInt(decoded, 10);
      return isNaN(id) ? null : id;
    } catch {
      return null;
    }
  }
}
