import * as errors from '../common/errorMessages';
import validationResponse from './validationResponse';

const payloadValidatorService = (tvshows) => {
    if (!tvshows.payload) {
        return validationResponse(false, errors.errorPayloadIsMissing);
    }
    if (!Array.isArray(tvshows.payload)) {
        return validationResponse(false, errors.errorPayloadTypeMismatch);
    }
    return validationResponse(true, "");
};

export default payloadValidatorService;