function ensureAdmin(req, res, next) {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return next();
}

module.exports = { ensureAdmin };
