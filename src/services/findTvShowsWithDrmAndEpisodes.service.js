import payloadValidatorService from './payloadValidator.service';
import isDrmEnabledAndHasEpisodesService from './isDrmEnabledAndHasEpisodes.service';
import getTvShowInfoService from './getTvShowInfo.service';

const findTvShowsWithDrmAndEpisodesService = (tvshows) => {
    let response = {
        response: []
    };
    if (!payloadValidatorService(tvshows).isValid) {
        return response;
    }
    const filteredshows = tvshows.payload.filter(isDrmEnabledAndHasEpisodesService);
    const showsinfo = filteredshows.map(show => getTvShowInfoService(show));
    response.response = showsinfo;
    return response;
};

export default findTvShowsWithDrmAndEpisodesService;