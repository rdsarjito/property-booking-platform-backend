import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta?: unknown;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((result) => {
        // If result already matches the success format, return as is
        if (result && typeof result === 'object' && 'success' in result) {
          return result as Response<T>;
        }

        // If result has separate data and meta fields (for pagination)
        if (result && typeof result === 'object' && 'data' in result && 'meta' in result) {
          const { data, meta, ...rest } = result as { data: T; meta: unknown };
          return {
            success: true,
            data,
            meta,
            ...rest,
          };
        }

        return {
          success: true,
          data: result as T,
        };
      }),
    );
  }
}
