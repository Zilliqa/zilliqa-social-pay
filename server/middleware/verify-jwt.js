
const models = require('../models');
const { User } = models.sequelize.models;

const ERROR_CODES = require('../../config/error-codes');

module.exports = async function (req, res, next) {
  const jwtToken = req.headers.authorization;
  const statuses = new User().statuses;

  try {
    const decoded = await new User().verify(jwtToken);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        code: ERROR_CODES.unauthorized,
        message: 'Unauthorized'
      });
    } else if (user.status === statuses.baned) {
      return res.status(401).json({
        code: ERROR_CODES.ban,
        message: 'User has been banned'
      });
    }

    req.verification = {
      decoded,
      user
    };

    next();
  } catch (err) {
    req.app.settings.log.error('middleware/verify-jwt', err);

    res.clearCookie(process.env.SESSION);
    res.clearCookie(`${process.env.SESSION}.sig`);
    res.clearCookie('io');

    return res.status(401).json({
      code: ERROR_CODES.unauthorized,
      message: 'Unauthorized'
    });
  }
}
