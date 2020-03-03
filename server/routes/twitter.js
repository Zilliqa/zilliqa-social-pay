const router = require('express').Router();
const request = require('request');
const passport = require('passport');

const API_URL = 'https://api.twitter.com/oauth';
const JWT_TOKEN_KEY = 'x-auth-token';

const userSign = (req, res) => {
  if (!req.user) {
    return res.status(401).send('User Not Authenticated');
  }

  req
    .user
    .sign()
    .then(({ token }) => req.token = token)
    .then(() => res.setHeader(JWT_TOKEN_KEY, req.token))
    .then(() => res.json({
      username: req.user.username,
      screenName: req.user.screenName,
      profileImageUrl: req.user.profileImageUrl,
      zilAddress: req.user.zilAddress,
      jwtToken: req.token
    }))
    .catch((err) => res.status(400).json({ message: err.message }));
}

router.all('/auth/twitter', (req, res, next) => {
  request.post({
    url: `${API_URL}/access_token?oauth_verifier`,
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
}, passport.authenticate('twitter-token', { session: false }), userSign);

router.post('/auth/twitter/reverse', (req, res) => {
  request.post({
    url: `${API_URL}/request_token`,
    oauth: {
      oauth_callback: "http%3A%2F%2Flocalhost%3A3001%2Ftwitter-callback",
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

router
  .route('/auth/token')
  .post(userSign);

module.exports = router;
