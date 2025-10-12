
import { Request, Response } from 'express';

export function sseHandler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const interval = setInterval(() => {
    res.write(`event: heartbeat\ndata: ${Date.now()}\n\n`);
  }, 15000);

  req.on('close', () => {
    clearInterval(interval);
  });

  // Initial event
  res.write(`data: ${JSON.stringify({ ok: true, ts: Date.now() })}\n\n`);
}