// Standard RFC 4122 UUID v4 regex check
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuid = (id) => typeof id === 'string' && UUID_REGEX.test(id);

/**
 * Route parameter validation middleware
 * Intercepts bad UUID parameters before triggering controller SQL execution
 */
const validateParamUuid = (paramName = 'id') => {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (value && !isUuid(value)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid ID format for parameter '${paramName}': "${value}". Expected a valid UUID.`,
      });
    }
    next();
  };
};

module.exports = {
  isUuid,
  validateParamUuid,
};