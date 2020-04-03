const router = require('express').Router();
const passport = require('passport');
const models = require('../models');
const zilliqa = require('../zilliqa');
const checkSession = require('../middleware/check-session');
const Twitter = require('../twitter');
const verifyJwt = require('../middleware/verify-jwt');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const User = models.sequelize.models.User;
const Twittes = models.sequelize.models.Twittes;
const Blockchain = models.sequelize.models.blockchain;

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

router.post('/auth/twitter/callback', (req, res) => {
  return res.status(200).send('');
});

router.put('/update/tweets', checkSession, verifyJwt, async (req, res) => {
  const { user } = req.verification;
  const blockchain = await Blockchain.findOne({
    where: {
      contract: CONTRACT_ADDRESS
    }
  });

  try {
    const twitter = new Twitter(user.token, user.tokenSecret, blockchain);
    const tweets = await twitter.userTimeline(user.profileId);

    if (!tweets || tweets.length < 1) {
      return res.json({
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
      message: err.message || err
    });
  }
});

router.post('/search/tweets/:query', checkSession, verifyJwt, async (req, res) => {
  const { query } = req.params;
  const { user } = req.verification;
  const blockchain = await Blockchain.findOne({
    where: {
      contract: CONTRACT_ADDRESS
    }
  });

  if (!query || isNaN(Number(query))) {
    return res.status(400).json({
      message: 'Bad query.'
    });
  }

  try {
    const twitter = new Twitter(user.token, user.tokenSecret, blockchain);
    const { tweet, hasHashtag } = await twitter.showTweet(query);
    const foundTwittes = await Twittes.findOne({
      where: { idStr: tweet.id_str },
      attributes: [
        'id',
        'idStr'
      ]
    });

    if (!tweet) {
      return res.status(401).json({
        message: 'Daily limit reached.'
      });
    } else if (!hasHashtag) {
      return res.status(404).json({
        message: `This tweet does not have the #${capitalizeFirstLetter(blockchain.hashtag)} hashtag in it.`
      });
    } else if (tweet.user.id_str !== user.profileId) {
      return res.status(400).json({
        message: 'User is not owner'
      });
    } else if (foundTwittes) {
      return res.status(400).json({
        message: 'Tweet already exists.'
      });
    }

    return res.status(302).json({
      id_str: tweet.id_str
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || err
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
    return res.status(400).json({
      message: err.message
    });
  }
});

module.exports = router;
