import express from 'express';
import router from '../api/routes/v1/routes';
import requestLogger from '../middleware/req.logger';

const app = express();

app.use(requestLogger);

app.use('/', router);
app.use(function(err, req, res, next) {
    res.status(500).json({ error: 'Something broke!' });
});

app.use(function(req, res, next) {
    res.status(404).json({ error: "Sorry can't find that!" });
});

export default app;