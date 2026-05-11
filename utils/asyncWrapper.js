module.exports = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(err => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('🔥', err.message, err.stack);
    } else {
      console.error(
        JSON.stringify({
          msg: err.message,
          status: err.statusCode || 500,
          path: req.path,
        })
      );
    }
    next(err);
  });
