import { Router } from 'express'
import { prisma } from '../db/prismaClient.js'

const router = Router()

/**
 * @route GET /api/health
 * @desc Liveness check to see if the server is running
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

/**
 * @route GET /api/ready
 * @desc Readiness check to see if the server and its dependencies (DB) are ready
 */
router.get('/ready', async (_req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (_error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: 'Service Unavailable',
      timestamp: new Date().toISOString(),
    })
  }
})

/**
 * @route GET /api/debug-sentry
 * @desc Temporary route to test Sentry error capturing
 */
router.get('/debug-sentry', (_req, _res) => {
  throw new Error('Sentry Debug Error - SIGMA-LA Backend')
})

import { ReportService } from '../providers/email/ReportService.js'

/**
 * @route GET /api/test-monthly-report
 * @desc Temporary test route to trigger the monthly report email
 */
router.get('/test-monthly-report', async (_req, res) => {
  try {
    const rs = new ReportService()
    await rs.sendMonthlyAdminReport()
    res.status(200).json({ message: 'Monthly report triggered successfully.' })
  } catch (error) {
    console.error('Error triggering monthly report:', error)
    res.status(500).json({ error: 'Failed to generate monthly report.', details: String(error) })
  }
})

export default router
