const preventCache = (req, res, next) => {
    // Forces the browser to re-validate with the server instead of using local cache
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
};

module.exports = { preventCache };