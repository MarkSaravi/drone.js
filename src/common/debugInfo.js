/* eslint-disable no-console */
const debugInfo = (msg) => {
    if (process.env.NODE_ENV != 'production') {
        console.log(msg);
    }
};

export { debugInfo };