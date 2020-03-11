const router = require('express').Router();
const { validation } = require('@zilliqa-js/util');
const checkSession = require('../middleware/check-session');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const models = require('../models');
const User = models.sequelize.models.User;
const Twittes = models.sequelize.models.Twittes;
const Blockchain = models.sequelize.models.blockchain;

router.put('/update/address/:address', checkSession, async (req, res) => {
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
    return res.status(501).json({
      message: 'Address must be unique!'
    });
  }
});

router.put('/sing/out', checkSession, (req, res) => {
  res.clearCookie(process.env.SESSION);

  return res.status(200).json({
    message: 'cleared'
  });
});

router.get('/get/tweets', checkSession, async (req, res) => {
  const userId = req.session.passport.user.id;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      res.clearCookie(process.env.SESSION);

      throw new Error('No found user.');
    }

    const twittes = await Twittes.findAll({
      where: {
        UserId: user.id
      }
    });

    return res.status(200).json(twittes);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message
    });
  }
});

router.get('/get/blockchain', checkSession, async (req, res) => {
  try {
    const blockchain = await Blockchain.findOne({
      where: {
        contract: CONTRACT_ADDRESS
      }
    });

    return res.status(200).json(blockchain);
  } catch (err) {
    return res.status(400).json({
      message: err.message
    });
  }
});

module.exports = router;
