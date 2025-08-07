import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedNextApiRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const userId = req.userId!;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  if (req.method === 'PUT') {
    const { title, description, status, categoryId } = req.body;

    try {
      const task = await prisma.task.updateMany({
        where: { id, userId },
        data: { title, description, status, categoryId }
      });
      if (task.count === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
      return res.json({ message: 'Task updated' });
    } catch (error) {
      return res.status(400).json({ error: 'Task update failed', detail: error });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const task = await prisma.task.deleteMany({
        where: { id, userId }
      });
      if (task.count === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
      return res.json({ message: 'Task deleted' });
    } catch (error) {
      return res.status(400).json({ error: 'Task deletion failed', detail: error });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withAuth(handler);
