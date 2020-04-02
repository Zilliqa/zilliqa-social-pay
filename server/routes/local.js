const express = require('express');
const { Op } = require('sequelize');
const { validation } = require('@zilliqa-js/util');
const checkSession = require('../middleware/check-session');
const models = require('../models');
const verifyJwt = require('../middleware/verify-jwt');
const router = express.Router();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const User = models.sequelize.models.User;
const Twittes = models.sequelize.models.Twittes;
const Blockchain = models.sequelize.models.blockchain;
const Admin = models.sequelize.models.Admin;
const actions = new User().actions;

router.put('/update/address/:address', checkSession, verifyJwt, async (req, res) => {
  const bech32Address = req.params.address;
  const { user, decoded } = req.verification;

  if (!validation.isBech32(bech32Address)) {
    return res.status(401).json({
      message: 'Invalid address format.'
    });
  }

  try {
    const blockchainInfo = await Blockchain.findOne({
      where: { contract: CONTRACT_ADDRESS }
    });
    let block = Number(blockchainInfo.BlockNum);

    if (!user.actionName) {
      block = 0;
    }

    await user.update({
      zilAddress: bech32Address,
      hash: null,
      synchronization: true,
      actionName: actions.configureUsers,
      lastAction: block
    });

    return res.status(201).json({
      ...decoded,
      zilAddress: bech32Address,
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
  res.clearCookie(`${process.env.SESSION}.sig`);
  res.clearCookie('io');

  return res.status(200).json({
    message: 'cleared'
  });
});

router.put('/claim/tweet', checkSession, verifyJwt, async (req, res) => {
  const { user } = req.verification;
  const tweet = req.body;
  let foundTweet = null;

  try {
    foundTweet = await Twittes.findOne({
      where: {
        UserId: user.id,
        idStr: tweet.idStr,
        id: tweet.id,
        rejected: false,
        approved: false,
        claimed: false
      },
      attributes: {
        exclude: [
          'text',
          'updatedAt'
        ]
      }
    });
  } catch (err) {
    return res.status(401).json({
      message: 'Bad request.'
    });
  }

  const blockchainInfo = await Blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const lastTweet = await Twittes.findOne({
    where: {
      block: {
        [Op.gt]: Number(blockchainInfo.BlockNum) - Number(blockchainInfo.blocksPerDay)
      },
      UserId: user.id
    }
  });

  if (lastTweet && lastTweet.block > 0) {
    return res.status(502).json({
      message: `Last tweet have block ${lastTweet.block} but current ${blockchainInfo.BlockNum}.`
    });
  }

  await foundTweet.update({
    block: blockchainInfo.BlockNum,
    claimed: true
  });

  return res.status(201).json(foundTweet);
});

router.post('/add/tweet', checkSession, verifyJwt, async (req, res) => {
  const { user, decoded } = req.verification;
  const tweet = req.body;

  if (!tweet || !tweet.full_text) {
    return res.status(401).json({
      message: 'Invalid tweet data.'
    });
  }

  try {
    if (!user || user.profileId !== tweet.user.id_str) {
      return res.status(401).json({
        message: 'Invalid user data.'
      });
    } else if (!tweet.user || tweet.user.id_str !== user.profileId) {
      return res.status(401).json({
        message: 'Invalid user data.'
      });
    }

    const blockchainInfo = await Blockchain.findOne({
      where: { contract: CONTRACT_ADDRESS }
    });

    await Twittes.create({
      idStr: tweet.id_str,
      text: tweet.full_text.toLowerCase(),
      UserId: user.id,
      block: blockchainInfo.BlockNum
    });

    await user.update({
      username: tweet.user.name,
      screenName: tweet.user.screen_name,
      profileImageUrl: tweet.user.profile_image_url
    });

    return res.status(201).json({
      message: 'Added.'
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message
    });
  }
});

router.get('/get/tweets', checkSession, async (req, res) => {
  const userId = req.session.passport.user.id;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      res.clearCookie(process.env.SESSION);
      res.clearCookie(`${process.env.SESSION}.sig`);
      res.clearCookie('io');

      throw new Error('No found user.');
    }

    const twittes = await Twittes.findAll({
      where: {
        UserId: user.id
      },
      attributes: {
        exclude: [
          'text',
          'updatedAt'
        ]
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
