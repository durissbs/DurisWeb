import { Router } from 'express';
import type { IRouter } from 'express';

const router: IRouter = Router();

// Keep the old provider URL only to reject deliveries without reading their data.
router.post('/', (_req, res) => {
  res.status(410).send('Donations are no longer supported');
});

export default router;
