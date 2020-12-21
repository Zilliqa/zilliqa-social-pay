const router = require('express').Router();
const { Op } = require('sequelize');
const passport = require('passport');
const models = require('../models');
const zilliqa = require('../zilliqa');
const checkSession = require('../middleware/check-session');
const Twitter = require('../twitter');
const verifyJwt = require('../middleware/verify-jwt');
const verifyCampaign = require('../middleware/campaign-check');
const verifyRecaptcha = require('../middleware/recaptcha');

const ERROR_CODES = require('../../config/error-codes');

const LIKES_FOR_CLAIM = Number(process.env.LIKES_FOR_CLAIM) || 5;
const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];
const JOB_TYPES = require('../config/job-types');
const BLOCK_FOR_CONFIRM = 2;

const dev = ENV !== 'production';
const {
  User,
  Twittes,
  Notification
} = models.sequelize.models;

const notificationTypes = new Notification().types;

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
 *       - jwtToken
 *     properties:
 *       id:
 *         type: integer
 *         format: int64
 *       profileId:
 *         type: string
 *       jwtToken:
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

const userSign = (req, res) => {
  if (!req.user) {
    return res.status(401).send('User Not Authenticated');
  }

  req
    .user
    .sign()
    .then(({ token }) => req.token = token)
    .then(() => res.json({
      username: req.user.username,
      screenName: req.user.screenName,
      profileImageUrl: req.user.profileImageUrl,
      zilAddress: req.user.zilAddress,
      jwtToken: req.token,
      synchronization: req.user.synchronization
    }))
    .catch((err) => res.status(400).json({ message: err.message }));
}

function capitalizeFirstLetter(arrayOfStr) {
  return arrayOfStr.map((string) => {
    return `#${string.charAt(1).toUpperCase() + string.slice(2)}`;
  });
}

/**
 * @swagger
 * /auth/twitter:
 *   post:
 *     description: Authentication through Twitter oauth.
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: oauth_token
 *         required: true
 *         type: string
 *       - name: oauth_verifier
 *         required: true
 *         type: string
 *     responses:
 *       400:
 *         description: Invalid query params.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       200:
 *         description: blockchain info.
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.post('/auth/twitter', async (req, res, next) => {
  const oauthToken = req.query.oauth_token;
  const oauthVerifier = req.query.oauth_verifier;

  if (!oauthToken || !oauthVerifier) {
    return res
      .status(400)
      .json({
        message: 'Bad query params.'
      });
  }

  try {
    const body = await Twitter.accessToken(oauthToken, oauthVerifier);

    req.body['oauth_token'] = body.oauth_token;
    req.body['oauth_token_secret'] = body.oauth_token_secret;
    req.body['user_id'] = body.user_id;
    req.body['screen_name'] = body.screen_name;

    next();
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || err });
  }
}, passport.authenticate('twitter-token'), userSign);

/**
 * @swagger
 * /auth/twitter/reverse:
 *   post:
 *     description: Parse twitter oauth token for will get `oauth_token` and `oauth_verifier`.
 *     produces:
 *      - application/json
 *     responses:
 *       400:
 *         description: Invalid query params.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       200:
 *         description: Twitter account tokens.
 *         schema:
 *           type: object
 *           properties:
 *             oauth_token:
 *               type: string
 *             oauth_verifier:
 *               type: string
 */
router.post('/auth/twitter/reverse', async (req, res) => {
  try {
    const body = await Twitter.requestToken();

    return res.status(200).send(body);
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || err });
  }
});

/**
 * @swagger
 * /auth/twitter/callback:
 *   get:
 *     description: Parse twitter oauth token for will get `oauth_token` and `oauth_verifier`.
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Twitter account tokens.
 *         schema:
 *           type: string
 */
router.get('/auth/twitter/callback', (req, res) => {
  return res.status(200).send('');
});

/**
 * @swagger
 * /update/tweets:
 *   put:
 *     description: Get and update user timeline tweets.
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
 *             code:
 *               type: integer
 *               format: int8
 *             message:
 *               type: string
 *             tweets:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/Tweet'
 */
router.put('/update/tweets', checkSession, verifyJwt, verifyCampaign, async (req, res) => {
  const { user } = req.verification;
  const { blockchainInfo } = req;

  try {
    const twitter = new Twitter(user.token, user.tokenSecret, blockchainInfo);
    const tweets = await twitter.userTimeline(user.profileId);

    if (!tweets || tweets.length < 1) {
      return res.json({
        code: ERROR_CODES.noFound,
        message: 'not found',
        tweets: []
      });
    }

    const newTweetes = tweets.map((tweet) => Twittes.create({
      idStr: tweet.id_str,
      text: String(tweet.full_text).toLowerCase(),
      UserId: user.id,
      createdAt: tweet.created_at
    }).catch(() => null));
    let tweetsUpdated = await Promise.all(newTweetes);

    tweetsUpdated = tweetsUpdated.filter(Boolean);

    return res.json({
      message: tweetsUpdated.length > 1 ? 'updated' : 'not found',
      tweets: tweetsUpdated.filter(Boolean)
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
 * /search/tweets/:
 *   post:
 *     description: Get and update user timeline tweets.
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: query
 *         description: Tweet ID.
 *         required: true
 *         in: query
 *         type: integer
 *         format: int32
 *     responses:
 *       400:
 *         description: Incorrect query params.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       404:
 *         description: Not found tweet.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       401:
 *         description: Unauthorized or bun.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       302:
 *         description: Found tweet.
 *         schema:
 *           type: object
 *           properties:
 *             id_str:
 *               type: integer
 *               format: int64
 */
router.post('/search/tweets/:query', checkSession, verifyJwt, verifyCampaign, async (req, res) => {
  const { query } = req.params;
  const { user } = req.verification;
  const { blockchainInfo } = req;

  if (!query || isNaN(query)) {
    return res.status(400).json({
      code: ERROR_CODES.badQuery,
      message: 'Bad query.'
    });
  }

  try {
    const twitter = new Twitter(user.token, user.tokenSecret, blockchainInfo);
    const { tweet, hasHashtag } = await twitter.showTweet(query);

    if (!tweet) {
      return res.json({
        code: ERROR_CODES.noFound,
        message: 'not found'
      });
    }

    const foundTwittes = await Twittes.findOne({
      where: { idStr: tweet.id_str },
      attributes: [
        'id',
        'idStr'
      ]
    });

    if (!tweet) {
      return res.status(400).json({
        code: ERROR_CODES.limitReached,
        message: 'Daily limit reached.'
      });
    } else if (!hasHashtag) {
      return res.status(404).json({
        code: ERROR_CODES.noHasHashtag,
        message: `This tweet does not have the ${capitalizeFirstLetter(blockchainInfo.hashtags).join(', ')} hashtag in it.`
      });
    } else if (tweet.user.id_str !== user.profileId) {
      return res.status(400).json({
        code: ERROR_CODES.badData,
        message: 'Wrong account'
      });
    } else if (foundTwittes) {
      return res.status(400).json({
        code: ERROR_CODES.alreadyExists,
        message: 'Tweet already exists.'
      });
    }

    return res.status(302).json({
      id_str: tweet.id_str
    });
  } catch (err) {
    if (Array.isArray(err)) {
      return res.status(400).json({
        ...err[0],
        debug: dev ? (err.message || err) : undefined
      });
    }

    return res.status(400).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.',
      debug: dev ? (err.message || err) : undefined
    });
  }
});

/**
 * @swagger
 * /add/tweet:
 *   post:
 *     description: Add tweet to database and claim it.
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id_str
 *         description: Tweet ID.
 *         required: true
 *         type: integer
 *         format: int32
 *     responses:
 *       400:
 *         description: Incorrect query params.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       404:
 *         description: Not found tweet.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       401:
 *         description: Unauthorized or bun.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       200:
 *         description: Found tweet.
 *         schema:
 *           type: object
 *           properties:
 *             code:
 *               type: integer
 *               format: int8
 *             message:
 *               type: string
 *             tweet:
 *               $ref: '#/definitions/Tweet'
 *               claimed:
 *                 default: true
 */
router.post('/add/tweet', checkSession, verifyJwt, verifyCampaign, async (req, res) => {
  const { user } = req.verification;
  const { id_str } = req.body;
  const { redis } = req.app.settings;
  const { blockchainInfo } = req;

  if (!id_str) {
    return res.status(400).json({
      code: ERROR_CODES.badData,
      message: 'Invalid tweet data.'
    });
  }

  try {
    const twitter = new Twitter(user.token, user.tokenSecret, blockchainInfo);
    const { tweet, hasHashtag } = await twitter.showTweet(id_str);
    const favoriteCount = Number(tweet.favorite_count);
    const foundTwittes = await Twittes.findOne({
      where: { idStr: id_str },
      attributes: [
        'id',
        'idStr'
      ]
    });

    if (foundTwittes) {
      return res.status(400).json({
        code: ERROR_CODES.alreadyExists,
        message: 'Tweet already exists.'
      });
    } else if (!hasHashtag) {
      return res.status(404).json({
        code: ERROR_CODES.noHasHashtag,
        message: `This tweet does not have the ${capitalizeFirstLetter(blockchainInfo.hashtags).join(', ')} hashtag in it.`
      });
    } else if (!user || user.profileId !== tweet.user.id_str) {
      return res.status(400).json({
        code: ERROR_CODES.badData,
        message: 'Invalid user data.'
      });
    } else if (!tweet.user || tweet.user.id_str !== user.profileId) {
      return res.status(400).json({
        code: ERROR_CODES.badData,
        message: 'Invalid user data.'
      });
    } else if (favoriteCount < Number(LIKES_FOR_CLAIM)) {
      return res.status(200).json({
        code: ERROR_CODES.lowFavoriteCount,
        favoriteCount,
        favoriteCountForClaim: Number(LIKES_FOR_CLAIM),
        message: `The reward is only claimable when the tweet has ${LIKES_FOR_CLAIM} like(s) or more.`
      });
    }

    const createdTweet = await Twittes.create({
      idStr: tweet.id_str,
      text: tweet.full_text.toLowerCase(),
      UserId: user.id
    });

    await user.update({
      username: tweet.user.name,
      screenName: tweet.user.screen_name,
      profileImageUrl: tweet.user.profile_image_url_https
    });

    const payload = JSON.stringify({
      type: JOB_TYPES.verifyTweet,
      tweetId: createdTweet.id,
      userId: user.id
    });
    redis.publish(REDIS_CONFIG.channels.TX_HANDLER, payload);

    const notification = await Notification.create({
      UserId: user.id,
      type: notificationTypes.tweetClaiming,
      title: 'Tweet',
      description: 'Claiming rewards…'
    });

    redis.publish(REDIS_CONFIG.channels.WEB, JSON.stringify({
      model: Notification.tableName,
      body: notification
    }));

    delete createdTweet.dataValues.text;
    delete createdTweet.dataValues.updatedAt;

    return res.status(201).json({
      message: 'Added.',
      tweet: createdTweet
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
 * /claim/tweet:
 *   put:
 *     description: Claim tweet.
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: tweet
 *         description: Tweet model.
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/Tweet'
 *     responses:
 *       400:
 *         description: Incorrect query params.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       401:
 *         description: Unauthorized or bun.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       201:
 *         description: Tweet.
 *         schema:
 *           $ref: '#/definitions/Tweet'
 */
router.put('/claim/tweet', checkSession, verifyJwt, verifyCampaign, verifyRecaptcha, async (req, res) => {
  const { user } = req.verification;
  const { redis } = req.app.settings;
  const { blockchainInfo } = req;
  const tweet = req.body;
  let foundTweet = null;

  if (!user.zilAddress) {
    return res.status(400).json({
      code: ERROR_CODES.noAddress,
      message: 'need to sync zilAddress.'
    });
  } else if (user.synchronization) {
    return res.status(400).json({
      code: ERROR_CODES.noAddressSynchronized,
      message: 'User zilAddress is not synchronized.'
    });
  }

  const lastTweet = await Twittes.findOne({
    where: {
      block: {
        [Op.gt]: Number(blockchainInfo.BlockNum) - Number(blockchainInfo.blocksPerDay)
      },
      UserId: user.id
    }
  });

  try {
    foundTweet = await Twittes.findOne({
      where: {
        UserId: user.id,
        idStr: tweet.idStr,
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
    return res.status(400).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.',
      lastTweet: Number(lastTweet.block),
      currentBlock: BLOCK_FOR_CONFIRM + Number(blockchainInfo.BlockNum) + Number(blockchainInfo.blocksPerDay),
      debug: (err.message || err)
    });
  }

  if (lastTweet && Number(lastTweet.block) > 0) {
    return res.status(200).json({
      code: ERROR_CODES.countdown,
      message: `Last tweet have block ${lastTweet.block} but current ${blockchainInfo.BlockNum}.`,
      lastTweet: Number(lastTweet.block),
      currentBlock: BLOCK_FOR_CONFIRM + Number(blockchainInfo.BlockNum) + Number(blockchainInfo.blocksPerDay)
    });
  }

  try {
    const twitter = new Twitter(user.token, user.tokenSecret, blockchainInfo);
    const { tweet } = await twitter.showTweet(foundTweet.idStr);
    const favoriteCount = Number(tweet.favorite_count);

    if (favoriteCount < Number(LIKES_FOR_CLAIM)) {
      return res.status(200).json({
        code: ERROR_CODES.lowFavoriteCount,
        favoriteCount,
        favoriteCountForClaim: Number(LIKES_FOR_CLAIM),
        message: `The reward is only claimable when the tweet has ${LIKES_FOR_CLAIM} likes or more.`
      });
    }

    await foundTweet.update({
      block: blockchainInfo.BlockNum,
      claimed: true
    });

    const payload = JSON.stringify({
      type: JOB_TYPES.verifyTweet,
      tweetId: foundTweet.id,
      userId: user.id
    });
    redis.publish(REDIS_CONFIG.channels.TX_HANDLER, payload);

    const notification = await Notification.create({
      UserId: user.id,
      type: notificationTypes.tweetClaiming,
      title: 'Tweet',
      description: 'Claiming rewards…'
    });

    redis.publish(REDIS_CONFIG.channels.WEB, JSON.stringify({
      model: Notification.tableName,
      body: notification
    }));

    return res.status(201).json(foundTweet);
  } catch (err) {
    return res.status(400).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.',
      lastTweet: blockchainInfo.BlockNum,
      currentBlock: BLOCK_FOR_CONFIRM + Number(blockchainInfo.BlockNum) + Number(blockchainInfo.blocksPerDay),
      debug: (err.message || err)
    });
  }
});

/**
 * @swagger
 * /claim/tweet:
 *   delete:
 *     description: Delete the deleted tweet.
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: id
 *         description: Tweet id.
 *         required: true
 *         in: query
 *         type: integer
 *     responses:
 *       400:
 *         description: Incorrect query params.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       401:
 *         description: Unauthorized or bun.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       200:
 *         description: Tweet ID.
 *         schema:
 *           type: integer
 */
router.delete('/delete/tweete/:id', checkSession, verifyJwt, async (req, res) => {
  const { id } = req.params;

  try {
    if (isNaN(id)) {
      throw new Error('ID must be number.');
    }

    await Twittes.destroy({
      where: {
        id
      }
    });

    return res.status(200).send(id);
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
 * /get/account:
 *   get:
 *     description: Show account info by session.
 *     produces:
 *      - application/json
 *     responses:
 *       400:
 *         description: Incorrect request.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       401:
 *         description: Unauthorized or bun.
 *         schema:
 *           $ref: '#/definitions/GeneralError'
 *       200:
 *         description: User model.
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.get('/get/account', checkSession, async (req, res) => {
  const userId = req.session.passport.user.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: [
          'tokenSecret',
          'token'
        ]
      }
    });
    const { balance } = await zilliqa.getCurrentAccount(
      user.zilAddress
    );

    user.dataValues.balance = balance;

    return res.status(200).json(user);
  } catch (err) {
    return res.status(400).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.',
      debug: dev ? (err.message || err) : undefined
    });
  }
});

module.exports = router;
