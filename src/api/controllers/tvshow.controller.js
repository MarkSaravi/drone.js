import httpStatus from 'http-status';
import payloadValidatorService from '../../services/payloadValidator.service';
import findTvShowsWithDrmAndEpisodesService from '../../services/findTvShowsWithDrmAndEpisodes.service';
import * as errors from '../../common/errorMessages';

class tvShowController {
    findDRMenabled(req, res) {
        if (!req.body) {
            return res.status(httpStatus.BAD_REQUEST).json({ error: errors.badRequestMessage });
        }
        const payloadValidationResult = payloadValidatorService(req.body);
        if (!payloadValidationResult.isValid) {
            return res.status(httpStatus.BAD_REQUEST).json({ error: payloadValidationResult.message });
        }
        return res.status(httpStatus.OK).json(findTvShowsWithDrmAndEpisodesService(req.body));
    }
}

export default tvShowController;