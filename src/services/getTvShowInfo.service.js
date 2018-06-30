const stringOrNull = (field) => {
    var res = field || null;
    if (typeof res === 'string') {
        return res;
    }
    return null;
};

const getImage = (img) => {
    var res = img || null;
    if (res == null) return null;
    let t = Object.prototype.toString.call(img);
    if (t !== '[object Object]') {
        return null;
    }
    res = img.showImage || null;
    if (typeof img.showImage === 'string') {
        return img.showImage;
    }
    return null;
};

const getTvShowInfoService = (item) => {
    return {
        image: getImage(item.image),
        slug: stringOrNull(item.slug),
        title: stringOrNull(item.title)
    };
};

export default getTvShowInfoService;