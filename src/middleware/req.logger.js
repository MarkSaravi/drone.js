import { debugInfo } from '../common/debugInfo';

const requestLogger = (req, res, next) => {
    debugInfo(req.originalUrl);
    next();
};

export default requestLogger;