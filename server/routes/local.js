const express = require('express');
const { validation } = require('@zilliqa-js/util');
const checkSession = require('../middleware/check-session');
const models = require('../models');
const verifyJwt = require('../middleware/verify-jwt');
const router = express.Router();

const ERROR_CODES = require('../../config/error-codes');
const ENV = process.env.NODE_ENV;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const MAX_AMOUNT_NOTIFICATIONS = process.env.MAX_AMOUNT_NOTIFICATIONS || 3;
const BLOCK_FOR_CONFIRM = 2;

const dev = ENV !== 'production';
const {
  User,
  Twittes,
  blockchain,
  Notification,
  Admin
} = models.sequelize.models;

const actions = new User().actions;
const notificationTypes = new Notification().types;

router.put('/update/address/:address', checkSession, verifyJwt, async (req, res) => {
  const bech32Address = req.params.address;
  const { user } = req.verification;

  try {
    if (!validation.isBech32(bech32Address)) {
      return res.status(401).json({
        code: ERROR_CODES.invalidAddressFormat,
        message: 'Invalid address format.'
      });
    }

    const userExist = await User.count({
      where: {
        zilAddress: bech32Address
      }
    });

    if (userExist > 0) {
      return res.status(401).json({
        code: ERROR_CODES.alreadyExists,
        message: 'This address is already registered.'
      });
    }

    const blockchainInfo = await blockchain.findOne({
      where: { contract: CONTRACT_ADDRESS }
    });
    let block = BLOCK_FOR_CONFIRM + Number(blockchainInfo.BlockNum) + Number(blockchainInfo.blocksPerWeek);

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

    await Notification.create({
      UserId: user.id,
      type: notificationTypes.addressConfiguring,
      title: 'Account',
      description: 'Syncing Address...'
    });

    delete user.dataValues.tokenSecret;
    delete user.dataValues.token;

    return res.status(201).json({
      user,
      message: 'ConfiguredUserAddress',
    });
  } catch (err) {
    if (dev) {
      return res.status(401).send(err.message || err);;
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
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
    if (dev) {
      return res.status(401).send(err.message || err);;
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
    });
  }
});

router.get('/get/blockchain', checkSession, async (req, res) => {
  try {
    const blockchainInfo = await blockchain.findOne({
      where: {
        contract: CONTRACT_ADDRESS
      }
    });

    return res.status(200).json(blockchainInfo);
  } catch (err) {
    if (dev) {
      return res.status(401).send(err.message || err);;
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
    });
  }
});

router.get('/get/notifications', checkSession, async (req, res) => {
  const UserId = req.session.passport.user.id;
  const limit = isNaN(req.query.limit) ? MAX_AMOUNT_NOTIFICATIONS : req.query.limit;
  const offset = req.query.offset || 0;

  try {
    const notificationCount = await Notification.count({
      where: {
        UserId
      }
    });
    const userNotification = await Notification.findAll({
      limit,
      offset,
      where: {
        UserId
      },
      order: [
        ['createdAt', 'DESC']
      ],
      attributes: {
        exclude: [
          'updatedAt'
        ]
      }
    });

    return res.status(200).json({
      limit: Number(limit),
      notification: userNotification,
      count: Number(notificationCount)
    });
  } catch (err) {
    if (dev) {
      return res.status(401).send(err.message || err);;
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
    });
  }
});

router.delete('/delete/notifications', checkSession, verifyJwt, async (req, res) => {
  const { user } = req.verification;

  try {
    await Notification.destroy({
      where: {
        UserId: user.id
      }
    });

    return res.status(204);
  } catch (err) {
    if (dev) {
      return res.status(401).send(err.message || err);;
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
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
