
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { apiLimiter } from '../lib/security/rateLimit'
import { authMiddleware } from '../lib/security/auth'
import { requireRole, Roles } from '../lib/security/roles'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))
app.use('/api', apiLimiter)

// Health
app.get('/health', (_req,res) => res.json({ status: 'ok', ts: Date.now() }))

// Docs
import '../lib/docs/swagger' // side effect registers swagger route
// Versioned routes
import v1Router from './routes/v1'
app.use('/api/v1', v1Router)

// Protected example
app.get('/api/v1/admin/example', authMiddleware, requireRole(Roles.Admin), (_req,res) => {
  res.json({ secure: true })
})

export default app