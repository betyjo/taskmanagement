import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyToken(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('No token');

  const token = authHeader.split(' ')[1];
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}
