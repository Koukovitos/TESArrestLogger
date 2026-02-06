import { z } from 'zod';
import { insertArrestSchema, arrests } from './schema';

export const api = {
  arrests: {
    list: {
      method: 'GET' as const,
      path: '/api/arrests',
      responses: {
        200: z.array(z.custom<typeof arrests.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/arrests',
      input: insertArrestSchema,
      responses: {
        201: z.custom<typeof arrests.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    }
  }
};
