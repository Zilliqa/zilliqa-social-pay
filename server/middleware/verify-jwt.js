const models = require('../models');
const User = models.sequelize.models.User;

module.exports = async function(req, res, next) {
  const jwtToken = req.headers.authorization;

  try {
    const decoded = await new User().verify(jwtToken);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new Error('Not found');
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
