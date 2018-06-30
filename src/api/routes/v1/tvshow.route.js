import httpStatus from 'http-status';
import express from 'express';
import tvShowController from '../../controllers/tvshow.controller';
import bodyParser from 'body-parser';
import * as errors from '../../../common/errorMessages';

const tvShowRouter = express.Router();
const showcontroller = new tvShowController();
tvShowRouter.use(bodyParser.json({
    type: '*/*'
}));
tvShowRouter.use((err, req, res, next) => {
    if (err) {
        res.status(httpStatus.BAD_REQUEST).json({ error: errors.badRequestMessage });
    } else {
        next();
    }
});
tvShowRouter
    .route('/')
    .post((req, res) => showcontroller.findDRMenabled(req, res))
    .all((req, res) => {
        res.status(httpStatus.METHOD_NOT_ALLOWED);
        res.json({ error: "method not allowd" });
    });

export default tvShowRouter;