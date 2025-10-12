import { Router, Request, Response, NextFunction } from 'express'
import { parseQuery, buildPrismaArgs } from '../../../lib/utils/pagination'
import { cacheMiddleware } from '../../../lib/cache/cache'
import { authMiddleware } from '../../../lib/security/auth'
import { requireRole, Roles } from '../../../lib/security/roles'
import { prisma } from '../../services/prisma'

const r = Router()

// helper to wrap async handlers
const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next)

r.get('/posts',
  cacheMiddleware(30, req => `posts:${JSON.stringify(req.query)}`),
  asyncHandler(async (req: Request, res: Response) => {
    const opts = parseQuery(req.query)
    const args = buildPrismaArgs(opts)
    const [data, total] = await Promise.all([
      prisma.post.findMany({ ...args, include: { author: true, tags: true } }),
      prisma.post.count({ where: args.where })
    ])
    res.json({ page: opts.page, pageSize: opts.pageSize, total, data })
  })
)

r.post('/posts',
  authMiddleware,
  requireRole(Roles.User),
  asyncHandler(async (req: Request & { user?: { id: string } }, res: Response) => {
    const { title, content, tags } = req.body || {}
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title required' })
    }
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'content required' })
    }
    if (!req.user?.id) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    // Basic tag handling (assumes tags is string[]). Adjust to your schema.
    const tagConnectOrCreate = Array.isArray(tags)
      ? tags.filter(t => typeof t === 'string' && t.trim()).map(name => ({
          where: { name },
          create: { name }
        }))
      : []

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        author: { connect: { id: req.user.id } },
        ...(tagConnectOrCreate.length
          ? { tags: { connectOrCreate: tagConnectOrCreate } }
          : {})
      },
      include: { author: true, tags: true }
    })
    res.status(201).json(newPost)
  })
)

export default r