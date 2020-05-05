const models = require('../models');
const { User } = models.sequelize.models;

const ERROR_CODES = require('../../config/error-codes');

module.exports = function (req, res, next) {
  const statuses = new User().statuses;

  if (!req.session || !req.session.passport || !req.session.passport.user) {
    res.clearCookie(process.env.SESSION);
    res.clearCookie(`${process.env.SESSION}.sig`);
    res.clearCookie('io');

    return res.status(401).json({
      code: ERROR_CODES.unauthorized,
      message: 'Unauthorized'
    });
  } else if (req.session.passport.user && req.session.passport.user.status === statuses.baned) {
    return res.status(401).json({
      code: ERROR_CODES.ban,
      message: 'User has been baned'
    });
  }

  next();
}
