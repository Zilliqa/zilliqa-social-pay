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

router.get('/get/tweets', checkSession, async (req, res) => {
  const UserId = req.session.passport.user.id;
  const limit = req.query.limit || 3;
  const offset = req.query.offset || 0;

  try {
    const count = await Twittes.count({
      where: {
        UserId
      }
    });
    const verifiedCount = await Twittes.count({
      where: {
        UserId,
        approved: true
      }
    });
    const lastActionTweet = await Twittes.findOne({
      order: [
        ['block', 'DESC']
      ],
      where: {
        UserId
      },
      attributes: [
        'block'
      ]
    });
    const tweets = await Twittes.findAll({
      limit,
      offset,
      order: [
        ['createdAt', 'DESC']
      ],
      where: {
        UserId
      },
      attributes: {
        exclude: [
          'text',
          'updatedAt'
        ]
      }
    });

    return res.status(200).json({
      tweets,
      count,
      verifiedCount,
      lastBlockNumber: !lastActionTweet ? 0 : lastActionTweet.block
    });
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
