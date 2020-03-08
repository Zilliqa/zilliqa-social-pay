const router = require('express').Router();
const { validation } = require('@zilliqa-js/util');

const models = require('../models');
const User = models.sequelize.models.User;
const Twittes = models.sequelize.models.Twittes;

router.put('/update/address/:address', async (req, res) => {
  const bech32Address = req.params.address;
  const jwtToken = req.headers.authorization;

  if (!validation.isBech32(bech32Address)) {
    return res.status(401).json({
      message: 'Invalid address format.'
    });
  }

  try {
    const user = new User();
    const decoded = await user.verify(jwtToken);

    await User.update({
      zilAddress: bech32Address
    }, {
      where: { id: decoded.id }
    });
  
    return res.status(200).json({
      ...decoded,
      zilAddress: bech32Address
    });
  } catch (err) {
    res.clearCookie(process.env.SESSION);

    return res.status(501).json({
      message: err.message
    });
  }
});

router.get('/get/tweets', async (req, res) => {
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    res.clearCookie(process.env.SESSION);

    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  const userId = req.session.passport.user.id;

  try {
    const user = await User.findByPk(userId);
    const twittes = await Twittes.findAll({
      where: {
        UserId: user.id
      }
    });

    return res.status(200).json(twittes);
  } catch (err) {
    return res.status(400).json({
      message: err.message
    });
  }
});

module.exports = router;
