function errorHandler(err, req, res, next) {
  console.error(err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Файл слишком большой. Максимальный размер 2 МБ' });
  }

  if (err.message === 'Можно загружать только JPEG и PNG') {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: err.status ? err.message : 'Внутренняя ошибка сервера'
  });
}

module.exports = errorHandler;
