const isDrmEnabledAndHasEpisodesService = (item) => {
    let t = Object.prototype.toString.call(item);
    if (t !== '[object Object]') {
        return false;
    }
    if (typeof item.episodeCount != 'number') {
        return false;
    }
    return item.drm === true && item.episodeCount > 0;
};

export default isDrmEnabledAndHasEpisodesService;