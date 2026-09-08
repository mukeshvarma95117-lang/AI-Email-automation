export function errorHandler(err, req, res, next) {
  console.error('Server error handler caught:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An unexpected internal server error occurred',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

