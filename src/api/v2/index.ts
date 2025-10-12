
import { Router } from 'express';
import { recommendationService } from '../../services/recommendationService';

export const v2Router = Router();

// Example: refined recommendation endpoint with pagination
v2Router.get('/recommendations', async (req, res, next) => {
  try {
    const userId = String(req.query.userId);
    const rec = await recommendationService.getRecommendations({ userId });
    res.json({ ...rec, meta: { modelVersion: '2.0.0' } });
  } catch (e) {
    next(e);
  }
});

v2Router.get('/health', (_req, res) => {
  res.json({ ok: true, version: 'v2' });
});