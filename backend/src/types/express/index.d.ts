import { Request } from "express";

import { AuthenticatedUser } from "types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
