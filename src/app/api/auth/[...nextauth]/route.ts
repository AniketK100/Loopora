/**
 * NextAuth REST API Handlers
 *
 * GET/POST /api/auth/* — NextAuth session, login, signup, callback handling.
 *
 * @route /api/auth/[...nextauth]
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
