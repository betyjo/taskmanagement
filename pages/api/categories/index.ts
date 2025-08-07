import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedNextApiRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  const userId = req.userId!;
  
  if (req.method === 'GET') {
    const categories = await prisma.category.findMany({
      where: { tasks: { some: { userId } } }
    });
    return res.json(categories);
  }

  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
      const category = await prisma.category.create({ data: { name } });
      return res.status(201).json(category);
    } catch (error) {
      return res.status(400).json({ error: 'Category creation failed', detail: error });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withAuth(handler);
