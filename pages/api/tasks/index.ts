import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedNextApiRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  const userId = req.userId!;
  
  if (req.method === 'GET') {
    const { category, status } = req.query;

    try {
      const tasks = await prisma.task.findMany({
        where: {
          userId,
          ...(status ? { status: String(status) } : {}),
          ...(category ? {
            category: {
              name: String(category)
            }
          } : {})
        },
        include: { category: true }
      });
      return res.status(200).json(tasks);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch tasks', detail: error });
    }
  }

  if (req.method === 'POST') {
    const { title, description, categoryId } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description required' });

    try {
      const task = await prisma.task.create({
        data: { title, description, userId, categoryId }
      });
      return res.status(201).json(task);
    } catch (error) {
      return res.status(400).json({ error: 'Task creation failed', detail: error });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withAuth(handler);
