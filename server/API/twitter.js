// const router = require('express').Router();
const Twitter = require('twitter');

/**
 * More infor [twitter doc](https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline).
 * @param {*} token User token.
 * @param {*} tokenSecret User secret token.
 * @param {*} userId User profile id.
 */
async function getTweets(token, tokenSecret, userId) {
  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: token,
    access_token_secret: tokenSecret
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
  getTweets
};
