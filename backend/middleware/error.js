export const errorHandler = (err, req, res, next) => { // eslint-disable-line
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id or value' });
  if (err.code === 11000) return res.status(409).json({ message: 'Duplicate entry' });
  if (err.status) return res.status(err.status).json({ message: err.message });
  console.error(err); res.status(500).json({ message: 'Internal server error' });
};
