module.exports = function(req, res, next) {
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    res.clearCookie(process.env.SESSION);

    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  next();
}
