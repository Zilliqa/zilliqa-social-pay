const express = require('express');
const { Op } = require('sequelize');
const { fromBech32Address } = require('@zilliqa-js/crypto');
const { validation } = require('@zilliqa-js/util');
const request = require('request');
const checkSession = require('../middleware/check-session');
const zilliqa = require('../zilliqa');
const models = require('../models');
const verifyJwt = require('../middleware/verify-jwt');
const verifyCampaign = require('../middleware/campaign-check');

const router = express.Router();

const ERROR_CODES = require('../../config/error-codes');
const { resolve } = require('path');
const { reject } = require('lodash');
const ENV = process.env.NODE_ENV || 'development';
const END_OF_CAMPAIGN = process.env.END_OF_CAMPAIGN;
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const MAX_AMOUNT_NOTIFICATIONS = process.env.MAX_AMOUNT_NOTIFICATIONS || 3;
const VERIFICATION_URL = 'https://www.google.com/recaptcha/api/siteverify' 

const dev = ENV !== 'production';
const {
  User,
  Twittes,
  Notification,
  Admin
} = models.sequelize.models;

const actions = new User().actions;

if (!END_OF_CAMPAIGN) {
  throw new Error('ENV: END_OF_CAMPAIGN is required!!!');
}

/**
 * @swagger
 *
 * definitions:
 *   User:
 *     type: object
 *     required:
 *       - id
 *       - profileId
 *       - profileImageUrl
 *       - screenName
 *       - status
 *       - synchronization
 *       - username
 *       - zilAddress
 *     properties:
 *       id:
 *         type: integer
 *         format: int64
 *       profileId:
 *         type: string
 *       profileImageUrl:
 *         type: string
 *       screenName:
 *         type: string
 *       status:
 *         type: boolean
 *       synchronization:
 *         type: boolean
 *         default: false
 *       username:
 *         type: string
 *       zilAddress:
 *         type: string
 *         format: bech32
 *   Tweet:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *         format: int64
 *       idStr:
 *         type: string
 *       UserId:
 *         type: integer
 *         format: int64
 *       approved:
 *         type: boolean
 *         default: false
 *       block:
 *         type: string
 *       claimed:
 *         type: boolean
 *         default: false
 *       rejected:
 *         type: boolean
 *         default: false
 *       createdAt:
 *         type: string
 *       txId:
 *         type: string
 *   Blockchain:
 *     description: "Blockchain information."
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         format: int64
 *       contract:
 *         type: integer
 *         format: bech32
 *       hashtag:
 *         type: string
 *       zilsPerTweet:
 *         type: string
 *       blocksPerDay:
 *         type: string
 *       blocksPerWeek:
 *         type: string
 *       BlockNum:
 *         type: string
 *       DSBlockNum:
 *         type: string
 *       rate:
 *         type: string
 *         default: 60000
 *       balance:
 *         type: string
 *       initBalance:
 *         type: string
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 *       campaignEnd:
 *         type: string
 *       now:
 *         type: string
 *   GeneralError:
 *     description: "Bad request."
 *     type: object
 *     properties:
 *       code:
 *         type: integer
 *         format: int8
 *       message:
 *         type: string
 *   Admin:
 *     description: "Admin account"
 *     type: object
 *     properties:
 *       bech32Address:
 *         type: string
 *         format: bech32
 *       address:
 *         type: string
 *         format: base16
 *       balance:
 *         type: string
 *       status:
 *         type: boolean
 *       nonce:
 *         type: integer
 *         format: int64
 *   JWT:
 *     authorization:
 *       description: The JWT token.
 *       schema:
 *         type: string
 */

/**
 * @swagger
 *
 * /update/address/:
 *   put:
 *     description: Create or update ZIL address(zil1).
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: address
 *         description: User Zilliqa bech32 address.
 *         required: true
 *         type: string
 *         format: bech32
 *     headers:
 *       $ref: '#/definitions/JWT'
 *     responses:
 *       200:
 *         description: Address has changed.
 *         type: object
 *         schema:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/definitions/User'
 *             message:
 *               type: string
 *       400:
 *         description: Invalid address format. or address is already registered.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       401:
 *         description: Unauthorized or bun.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 */
router.put('/update/address/:address', checkSession, verifyJwt, verifyCampaign, async (req, res) => {
  const bech32Address = req.params.address;
  const { user } = req.verification;
  const { recaptcha } = req.headers;
  const { remoteAddress } = req.connection
  const url = `${VERIFICATION_URL}?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptcha}&remoteip=${remoteAddress}`;
  const checkRecaptcha = () => new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        return reject(error)
      }
      body = JSON.parse(body);
      if (body.success) {
        return resolve(body)
      }
      return reject(body)
    });
  });

  try {
    await checkRecaptcha();
  } catch (err) {
    return res.status(400).json({
      code: ERROR_CODES.invalidRecaptcha,
      message: 'Invalid Recaptcha content.'
    });
  }

  try {
    if (!fromBech32Address(bech32Address)) {
      return res.status(400).json({
        code: ERROR_CODES.invalidAddressFormat,
        message: 'Invalid address format.'
      });
    }
  } catch (err) {
    return res.status(400).json({
      code: ERROR_CODES.invalidAddressFormat,
      message: 'Invalid address format.'
    });
  }

  try {
    if (!fromBech32Address(bech32Address)) {
      return res.status(400).json({
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
      return res.status(400).json({
        code: ERROR_CODES.alreadyExists,
        message: 'This address is already registered.'
      });
    }

    await user.update({
      zilAddress: bech32Address,
      hash: null,
      synchronization: false,
      actionName: actions.configureUsers
    });

    delete user.dataValues.tokenSecret;
    delete user.dataValues.token;

    return res.status(201).json({
      user,
      message: 'ConfiguredUserAddress',
    });
  } catch (err) {
    return res.status(400).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.',
      debug: dev ? (err.message || err) : undefined
    });
  }
});

/**
 * @swagger
 * /sing/out:
 *   put:
 *     description: Sign out, clear all sessions.
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: cleared.
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       401:
 *         description: Unauthorized or bun.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 */
router.put('/sing/out', checkSession, (req, res) => {
  res.clearCookie(process.env.SESSION);
  res.clearCookie(`${process.env.SESSION}.sig`);
  res.clearCookie('io');

  return res.status(200).json({
    message: 'cleared'
  });
});

/**
 * @swagger
 * /get/tweets:
 *   get:
 *     description: Get tweets by user seesion.
 *     parameters:
 *       - name: limit
 *         description: Max records to return.
 *         required: false
 *         in: query
 *         type: integer
 *         format: int32
 *       - name: offset
 *         description: Number of items to skip.
 *         required: false
 *         in: query
 *         type: integer
 *         format: int32
 *     produces:
 *      - application/json
 *     responses:
 *       400:
 *         description: Incorrect seesion params.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       401:
 *         description: Unauthorized or bun.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       200:
 *         description: User tweets.
 *         schema:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               format: int64
 *             verifiedCount:
 *               type: integer
 *               format: int64
 *             lastBlockNumber:
 *               type: integer
 *               format: int64
 *             tweets:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Tweet'
 */
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
    const lastActionTweet = await zilliqa.getLastWithdrawal([
      req.session.passport.user.profileId
    ]);
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
      lastBlockNumber: !lastActionTweet ? 0 : Number(lastActionTweet) + 1
    });
  } catch (err) {
    return res.status(400).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.',
      debug: dev ? (err.message || err) : undefined
    });
  }
});

/**
 * @swagger
 * /get/blockchain:
 *   get:
 *     description: Get the current blockchain info and contract init info.
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: blockchain info.
 *         schema:
 *           $ref: '#/definitions/Blockchain'
 */
router.get('/get/blockchain', async (req, res) => {
  return res.status(200).json(req.blockchainInfo);
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
    return res.status(400).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.',
      debug: dev ? (err.message || err) : undefined
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
    return res.status(400).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.',
      debug: dev ? (err.message || err) : undefined
    });
  }
});

/**
 * @swagger
 * /get/accounts:
 *   get:
 *     description: Show some information about admin accounts.
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Admin accounts info.
 *         schema:
 *           $ref: '#/definitions/Admin'
 */
router.get('/get/accounts', async (req, res) => {
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

/**
 * @swagger
 * /get/stats:
 *   get:
 *     description: Show some stats about users and tweets.
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: SocialPay stats.
 *         schema:
 *           type: object
 *           properties:
 *             pendingTweet:
 *               type: integer
 *               format: int64
 *             registeredUsers:
 *               type: integer
 *               format: int64
 *             approvedTweet:
 *               type: integer
 *               format: int64
 *             tweets:
 *               type: integer
 *               format: int64
 */
router.get('/get/stats', async (req, res) => {
  const pendingTweet = await Twittes.count({
    where: {
      approved: false,
      rejected: false,
      claimed: true
    }
  });
  const approvedTweet = await Twittes.count({
    where: {
      approved: true,
      rejected: false,
      claimed: true
    }
  });
  const tweets = await Twittes.count();
  const registeredUsers = await User.count({
    where: {
      synchronization: false,
      zilAddress: {
        [Op.not]: null
      }
    }
  });

  return res.json({
    pendingTweet,
    registeredUsers,
    approvedTweet,
    tweets
  });
});

module.exports = router;
