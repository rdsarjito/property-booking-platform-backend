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

  static encodeCursor(id: string): string {
    return Buffer.from(id).toString('base64');
  }

  static decodeCursor(cursor: string): string | null {
    try {
      return Buffer.from(cursor, 'base64').toString('ascii');
    } catch {
      return null;
    }
  }
}
