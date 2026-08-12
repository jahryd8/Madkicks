const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err);

  // PostgreSQL code '22P02' = invalid_text_representation (e.g., malformed UUIDs)
  if (err.code === '22P02') {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid ID format provided. One or more ID fields are not valid UUIDs.',
    });
  }

  // PostgreSQL code '23503' = foreign_key_violation
  if (err.code === '23503') {
    return res.status(404).json({
      status: 'fail',
      message: 'Referenced variant or product ID does not exist in database.',
    });
  }

  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;