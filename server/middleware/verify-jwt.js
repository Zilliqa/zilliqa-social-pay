const models = require('../models');
const { User } = models.sequelize.models;

module.exports = async function (req, res, next) {
  const jwtToken = req.headers.authorization;
  const statuses = new User().statuses;

  try {
    const decoded = await new User().verify(jwtToken);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new Error('Not found');
    } else if (user.status === statuses.baned) {
      throw new Error('User has been baned');
    }

    req.verification = {
      decoded,
      user
    };

    next();
  } catch (err) {
    res.clearCookie(process.env.SESSION);
    res.clearCookie(`${process.env.SESSION}.sig`);
    res.clearCookie('io');

    return res.status(401).json({
      message: 'Unauthorized'
    });
  }
}
