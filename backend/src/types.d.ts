/**
 * Express type augmentation for the authenticated user attached by
 * requireAuth middleware. Declared here so route handlers can access
 * `req.user` without TypeScript errors.
 *
 * See backend/src/auth.ts for the AuthedUser interface.
 */
declare namespace Express {
  interface Request {
    user?: import('./auth.js').AuthedUser;
  }
}
