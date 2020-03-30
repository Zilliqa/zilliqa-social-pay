const router = require('express').Router();
const Twitter = require('twitter');
const request = require('request');
const passport = require('passport');
const models = require('../models');
const zilliqa = require('../zilliqa');
const checkSession = require('../middleware/check-session');

const API_URL = 'https://api.twitter.com';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const User = models.sequelize.models.User;
const Twittes = models.sequelize.models.Twittes;
const Blockchain = models.sequelize.models.blockchain;
const callback = process.env.CALLBACK || 'http://localhost:3000';

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

router.post('/auth/twitter', (req, res, next) => {
  request.post({
    url: `${API_URL}/oauth/access_token?oauth_verifier`,
    oauth: {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      token: req.query.oauth_token
    },
    form: { oauth_verifier: req.query.oauth_verifier }
  }, (err, r, body) => {
    let parsedBody = null;

    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      parsedBody = JSON.parse(body);

      if (parsedBody.errors) {
        return res
          .status(400)
          .json({ messages: parsedBody.errors });
      }
    } catch (err) {
      //
    }

    try {
      const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';

      parsedBody = JSON.parse(bodyString);

      req.body['oauth_token'] = parsedBody.oauth_token;
      req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
      req.body['user_id'] = parsedBody.user_id;
      req.body['screen_name'] = parsedBody.screen_name;
    } catch (err) {
      return res
        .status(400)
        .json({ messages: body });
    }

    next();
  });
}, passport.authenticate('twitter-token'), userSign);

router.post('/auth/twitter/reverse', (req, res) => {
  request.post({
    url: `${API_URL}/oauth/request_token`,
    oauth: {
      oauth_callback: encodeURIComponent(`${callback}/api/v1/auth/twitter/callback`),
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET
    }
  }, (err, r, body) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const parsedBody = JSON.parse(body);

      if (parsedBody.errors) {
        return res.status(400).json({ messages: parsedBody.errors });
      }
    } catch (err) {
      const jsonStr = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';

      res.send(JSON.parse(jsonStr));
    }
  });
});

router.post('/auth/twitter/callback', (req, res) => {
  return res.status(200).send('');
});

router.put('/update/tweets', checkSession, async (req, res) => {
  const jwtToken = req.headers.authorization;
  const url = `${API_URL}/1.1/statuses/user_timeline.json`;
  let user = null;

  try {
    const decoded = await new User().verify(jwtToken);
    user = await User.findByPk(decoded.id);
  } catch (err) {
    res.clearCookie(process.env.SESSION);
    res.clearCookie(`${process.env.SESSION}.sig`);
    res.clearCookie('io');

    return res.status(401).json({
      message: err.message
    });
  }

  try {
    let filteredTweets = [];
    const blockchain = await Blockchain.findOne({
      where: {
        contract: CONTRACT_ADDRESS
      }
    });
    const client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: user.token,
      access_token_secret: user.tokenSecret
    });
    const params = {
      user_id: user.profileId,
      count: 100
    };
    const tweets = await client.get(url, params);

    if (!Array.isArray(tweets)) {
      return res.status(400).json({
        message: 'not found'
      });
    }

    filteredTweets = tweets.filter((tweet) => {
      const text = tweet.text.toLowerCase();
      const hashtag = blockchain.hashtag.toLowerCase();
      const userID = tweet.user.id_str;

      return text.includes(hashtag) && userID === user.profileId;
    });

    if (!filteredTweets || filteredTweets.length < 1) {
      return res.json({
        message: 'not found',
        tweets: []
      });
    }

    const newTweetes = filteredTweets.map((tweet) => Twittes.create({
      idStr: tweet.id_str,
      text: tweet.text.toLowerCase(),
      UserId: user.id
    }).catch(() => null));
    let tweetsUpdated = await Promise.all(newTweetes);

    tweetsUpdated = tweetsUpdated.filter(Boolean);

    return res.json({
      message: tweetsUpdated.length > 1 ? 'updated' : 'not found',
      tweets: tweetsUpdated.filter(Boolean)
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message
    });
  }
});

router.post('/search/tweets/:query', checkSession, async (req, res) => {
  const { query } = req.params;
  const jwtToken = req.headers.authorization;
  const urlById = `${API_URL}/1.1/statuses/show.json`;
  const blockchain = await Blockchain.findOne({
    where: {
      contract: CONTRACT_ADDRESS
    }
  });
  let user = null;

  try {
    const decoded = await new User().verify(jwtToken);

    user = await User.findByPk(decoded.id);
  } catch (err) {
    res.clearCookie(process.env.SESSION);
    res.clearCookie(`${process.env.SESSION}.sig`);
    res.clearCookie('io');

    return res.status(401).json({
      message: err.message
    });
  }

  try {
    const client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: user.token,
      access_token_secret: user.tokenSecret
    });
    const params = {
      id: query
    };
    const tweet = await client.get(urlById, params);
    const foundTwittes = await Twittes.findOne({
      where: { idStr: tweet.id_str }
    });

    if (!foundTwittes) {
      return res.status(401).json({
        message: 'Daily limit reached.'
      });
    }
    if (!tweet.text.toLowerCase().includes(blockchain.hashtag.toLowerCase())) {
      return res.status(404).json({
        message: `This tweet does not have the #${capitalizeFirstLetter(blockchain.hashtag)} hashtag in it.`
      });
    } else if (tweet.user.id_str !== user.profileId) {
      return res.status(404).json({
        message: 'User is not owner'
      });
    } else if (foundTwittes) {
      return res.status(400).json({
        message: 'Tweet already exists.'
      });
    }

    return res.status(302).json(tweet);
  } catch (err) {
    if (err && Array.isArray(err)) {
      return res.status(404).json({
        ...err[0]
      });
    }
    return res.status(400).json({
      message: err.message
    });
  }
});

router.get('/get/account', checkSession, async (req, res) => {
  const userId = req.session.passport.user.id;
  const url = `${API_URL}/1.1/users/show.json`;

  try {
    const user = await User.findByPk(userId);
    const { balance } = await zilliqa.getCurrentAccount(
      user.zilAddress
    );
    const client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: user.token,
      access_token_secret: user.tokenSecret
    });
    const params = {
      user_id: user.profileId
    };
    const foundUser = await client.get(url, params);

    await user.update({
      username: foundUser.name,
      screenName: foundUser.screen_name,
      profileImageUrl: foundUser.profile_image_url
    });

    delete user.dataValues.tokenSecret;
    delete user.dataValues.token;

    user.dataValues.balance = balance;

    return res.status(200).json(user);
  } catch (err) {
    return res.status(400).json({
      message: err.message
    });
  }
});

module.exports = router;
