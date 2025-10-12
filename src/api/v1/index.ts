
import { Router } from 'express';
import { recommendationService } from '../../services/recommendationService';
import { sendEmail } from '../../services/notification/emailService';
import { uploadBuffer } from '../../services/storage/uploader';

export const v1Router = Router();

v1Router.get('/health', (_req, res) => {
  res.json({ ok: true, version: 'v1' });
});

v1Router.post('/recommendations', async (req, res, next) => {
  try {
    const data = await recommendationService.getRecommendations(req.body);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

v1Router.post('/notify/email', async (req, res, next) => {
  try {
    const { to, subject, text, html } = req.body;
    const info = await sendEmail({ to, subject, text, html });
    res.json({ messageId: info.messageId });
  } catch (e) {
    next(e);
  }
});

v1Router.post('/upload', async (req, res, next) => {
  try {
    // Expecting raw body buffer or multipart middleware in existing stack
    const { filename = 'file.bin' } = req.query;
    const buffer: Buffer = (req as any).file?.buffer || req.body?.fileBuffer;
    if (!buffer) return res.status(400).json({ error: 'No file buffer provided' });
    const result = await uploadBuffer(buffer, String(filename));
    res.json(result);
  } catch (e) {
    next(e);
  }
});