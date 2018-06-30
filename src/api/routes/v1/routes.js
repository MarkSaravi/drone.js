import express from 'express';
import tvShowRouter from './tvshow.route';

const router = express.Router();

router.use('/', tvShowRouter);
router.get('/status', (req, res) => res.send('OK'));

export default router;