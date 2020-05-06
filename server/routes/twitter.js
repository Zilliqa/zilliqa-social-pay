const router = require('express').Router();
const { Op } = require('sequelize');
const passport = require('passport');
const models = require('../models');
const zilliqa = require('../zilliqa');
const checkSession = require('../middleware/check-session');
const Twitter = require('../twitter');
const verifyJwt = require('../middleware/verify-jwt');
const verifyCampaign = require('../middleware/campaign-check');
const ERROR_CODES = require('../../config/error-codes');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const LIKES_FOR_CLAIM = Number(process.env.LIKES_FOR_CLAIM) || 5;
const ENV = process.env.NODE_ENV;

const dev = ENV !== 'production';
const {
  User,
  Twittes,
  blockchain,
  Notification
} = models.sequelize.models;

const notificationTypes = new Notification().types;

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

function capitalizeFirstLetter(string) {
  return string.charAt(1).toUpperCase() + string.slice(2);
}

router.post('/auth/twitter', async (req, res, next) => {
  const oauthToken = req.query.oauth_token;
  const oauthVerifier = req.query.oauth_verifier;

  if (!oauthToken || !oauthVerifier) {
    return res
      .status(400)
      .json({ message: 'Bad query params.' });
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

router.get('/auth/twitter/callback', (req, res) => {
  return res.status(200).send('');
});

router.put('/update/tweets', checkSession, verifyJwt, verifyCampaign, async (req, res) => {
  const { user } = req.verification;
  const blockchainInfo = await blockchain.findOne({
    where: {
      contract: CONTRACT_ADDRESS
    }
  });

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
    if (dev) {
      return res.status(401).send(err.message || err);
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
    });
  }
});

router.post('/search/tweets/:query', checkSession, verifyJwt, verifyCampaign, async (req, res) => {
  const { query } = req.params;
  const { user } = req.verification;
  const blockchainInfo = await blockchain.findOne({
    where: {
      contract: CONTRACT_ADDRESS
    }
  });

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
      return res.status(401).json({
        code: ERROR_CODES.limitReached,
        message: 'Daily limit reached.'
      });
    } else if (!hasHashtag) {
      return res.status(404).json({
        code: ERROR_CODES.noHasHashtag,
        message: `This tweet does not have the #${capitalizeFirstLetter(blockchainInfo.hashtag)} hashtag in it.`
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
    if (dev) {
      return res.status(401).send(err.message || err);;
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
    });
  }
});

router.post('/add/tweet', checkSession, verifyJwt, verifyCampaign, async (req, res) => {
  const { user } = req.verification;
  const { id_str } = req.body;

  if (!id_str) {
    return res.status(401).json({
      code: ERROR_CODES.badData,
      message: 'Invalid tweet data.'
    });
  }

  const blockchainInfo = await blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });

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
        message: `This tweet does not have the #${capitalizeFirstLetter(blockchainInfo.hashtag)} hashtag in it.`
      });
    } else if (!user || user.profileId !== tweet.user.id_str) {
      return res.status(401).json({
        code: ERROR_CODES.badData,
        message: 'Invalid user data.'
      });
    } else if (!tweet.user || tweet.user.id_str !== user.profileId) {
      return res.status(401).json({
        code: ERROR_CODES.badData,
        message: 'Invalid user data.'
      });
    } else if (favoriteCount < Number(LIKES_FOR_CLAIM)) {
      return res.status(200).json({
        code: ERROR_CODES.lowFavoriteCount,
        favoriteCount,
        favoriteCountForClaim: Number(LIKES_FOR_CLAIM),
        message: `Reward is only claimable when tweet has > ${LIKES_FOR_CLAIM} likes.`
      });
    }

    const createdTweet = await Twittes.create({
      idStr: tweet.id_str,
      text: tweet.full_text.toLowerCase(),
      UserId: user.id,
      block: blockchainInfo.BlockNum,
      claimed: true
    });

    await user.update({
      username: tweet.user.name,
      screenName: tweet.user.screen_name,
      profileImageUrl: tweet.user.profile_image_url_https
    });

    await Notification.create({
      UserId: user.id,
      type: notificationTypes.tweetClaiming,
      title: 'Tweet',
      description: 'Claiming rewards…'
    });

    delete createdTweet.dataValues.text;
    delete createdTweet.dataValues.updatedAt;

    return res.status(201).json({
      message: 'Added.',
      tweet: createdTweet
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

router.put('/claim/tweet', checkSession, verifyJwt, verifyCampaign, async (req, res) => {
  const { user } = req.verification;
  const tweet = req.body;
  let foundTweet = null;

  if (!user.zilAddress) {
    return res.status(401).json({
      code: ERROR_CODES.noAddress,
      message: 'need to sync zilAddress.'
    });
  } else if (user.synchronization) {
    return res.status(401).json({
      code: ERROR_CODES.noAddressSynchronized,
      message: 'User zilAddress is not synchronized.'
    });
  }

  const blockchainInfo = await blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });

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
    if (dev) {
      return res.status(401).send(err.message || err);;
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
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

  if (lastTweet && Number(lastTweet.block) > 0) {
    return res.status(200).json({
      code: ERROR_CODES.countdown,
      message: `Last tweet have block ${lastTweet.block} but current ${blockchainInfo.BlockNum}.`,
      lastTweet: lastTweet.block,
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
        message: `Reward is only claimable when tweet has > ${LIKES_FOR_CLAIM} likes.`
      });
    }

    await foundTweet.update({
      block: blockchainInfo.BlockNum,
      claimed: true
    });

    await Notification.create({
      UserId: user.id,
      type: notificationTypes.tweetClaiming,
      title: 'Tweet',
      description: 'Claiming rewards…'
    });

    return res.status(201).json(foundTweet);
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
    if (dev) {
      return res.status(401).send(err.message || err);;
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
    });
  }
});

module.exports = router;
