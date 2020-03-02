// const router = require('express').Router();
const Twitter = require('twitter');

async function getTwitts(accessToken, accessTokenSecret, userId) {
  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: accessToken,
    access_token_secret: accessTokenSecret
  });
  const url = `/statuses/user_timeline.json?user_id=${userId}`;

  return new Promise((resolve, reject) => {
    client.get(url, { tweet_mode: 'extended' }, (err, data) => {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}

module.exports = {
  getTwitts
};
