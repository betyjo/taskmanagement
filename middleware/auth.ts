import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthenticatedNextApiRequest extends NextApiRequest {
  userId?: string;
}

export function withAuth(handler: NextApiHandler) {
  return async (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
