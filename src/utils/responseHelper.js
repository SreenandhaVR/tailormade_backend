// Success response helper
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Error response helper
const errorResponse = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Pagination response helper
const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    },
    timestamp: new Date().toISOString()
  });
};

// Created response helper
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

// No content response helper
const noContentResponse = (res) => {
  return res.status(204).send();
};

// Validation error response helper
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Validation failed', 400, errors);
};

// Not found response helper
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

// Unauthorized response helper
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 401);
};

// Forbidden response helper
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 403);
};

// Conflict response helper
const conflictResponse = (res, message = 'Resource conflict') => {
  return errorResponse(res, message, 409);
};

// Too many requests response helper
const tooManyRequestsResponse = (res, message = 'Too many requests') => {
  return errorResponse(res, message, 429);
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  tooManyRequestsResponse
}; 