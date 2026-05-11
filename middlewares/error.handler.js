module.exports = (err, req, res, next) => {
  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  // Handle Mongoose cast errors (e.g. invalid ObjectId format that bypassed validateId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid format for ${err.path}: ${err.value}` });
  }

  const status  = err.statusCode || err.status || 500;
  const message = (err.isOperational || process.env.NODE_ENV === 'development') 
    ? err.message 
    : 'Something went wrong.';
  const body    = { success: false, message };

  if (process.env.NODE_ENV === 'development') body.stack = err.stack;

  if (res.headersSent) return next(err);

  return res.status(status).json(body);
};
