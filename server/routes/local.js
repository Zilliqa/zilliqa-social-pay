const express = require('express');
const { validation } = require('@zilliqa-js/util');
const checkSession = require('../middleware/check-session');
const models = require('../models');
const router = express.Router();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const User = models.sequelize.models.User;
const Twittes = models.sequelize.models.Twittes;
const Blockchain = models.sequelize.models.blockchain;
const Admin = models.sequelize.models.Admin;

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
    const foundUser = await User.findByPk(decoded.id);

    await foundUser.update({
      zilAddress: bech32Address,
      hash: null,
      synchronization: true
    });
  
    return res.status(201).json({
      ...decoded,
      message: 'ConfiguredUserAddress',
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

router.post('/add/tweet', checkSession, async (req, res) => {
  const jwtToken = req.headers.authorization;
  const tweet = req.body;

  try {
    const user = new User();
    const decoded = await user.verify(jwtToken);
    const foundUser = await User.findByPk(decoded.id);

    if (!foundUser || foundUser.profileId !== tweet.user.id_str) {
      return res.status(401).json({
        message: 'Invalid tweet data.'
      });
    }

    await Twittes.create({
      idStr: tweet.id_str,
      text: tweet.text.toLowerCase(),
      UserId: foundUser.id
    });

    return res.status(201).json({
      message: 'Created'
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message
    });
  }
});

router.get('/get/accounts', checkSession, async (req, res) => {
  const accounts = await Admin.findAll({
    attributes: [
      'bech32Address',
      'address',
      'balance',
      'status',
      'nonce'
    ]
  });

  return res.json(accounts);
});

module.exports = router;
