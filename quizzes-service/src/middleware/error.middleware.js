function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Błąd walidacji danych',
      errors: err.errors
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      status: 'error',
      message: 'Konflikt danych - rekord już istnieje'
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      status: 'error',
      message: 'Nieprawidłowe powiązanie danych'
    });
  }

  res.status(500).json({
    status: 'error',
    message: 'Wystąpił błąd serwera'
  });
}

module.exports = errorHandler; 