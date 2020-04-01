const Twitter = require('twitter');
const request = require('request');

const API_URL = 'https://api.twitter.com';
const callback = process.env.CALLBACK || 'http://localhost:3000';

module.exports = class {

  static async accessToken(token, oauth_verifier) {
    return new Promise((resolve, reject) => {
      request.post({
        url: `${API_URL}/oauth/access_token?oauth_verifier`,
        oauth: {
          token,
          consumerKey: process.env.TWITTER_CONSUMER_KEY,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET
        },
        form: { oauth_verifier }
      }, (err, r, body) => {
        if (err) {
          return reject(err);
        }

        try {
          let parsedBody = JSON.parse(body);

          if (parsedBody.errors) {
            return reject(parsedBody.errors);
          }
        } catch (err) {
          //
        }

        const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';

        return resolve(JSON.parse(bodyString));
      });
    });
  }

  static async requestToken() {
    return new Promise((resolve, reject) => {
      request.post({
        url: `${API_URL}/oauth/request_token`,
        oauth: {
          oauth_callback: encodeURIComponent(`${callback}/api/v1/auth/twitter/callback`),
          consumer_key: process.env.TWITTER_CONSUMER_KEY,
          consumer_secret: process.env.TWITTER_CONSUMER_SECRET
        }
      }, (err, r, body) => {
        if (err) {
          return reject(err);
        }
    
        try {
          const parsedBody = JSON.parse(body);
    
          if (parsedBody.errors) {
            return reject(parsedBody.errors);
          }
        } catch (err) {
          //
        }

        try {
          const jsonStr = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';

          return resolve(JSON.parse(jsonStr));
        } catch (err) {
          return reject(body);
        }
      });
    });
  }

  constructor(access_token_key, access_token_secret, blockchain) {
    if (!access_token_key) {
      throw new Error('access_token_key is required');
    } else if (!access_token_secret) {
      throw new Error('access_token_secret is required');
    } else if (!blockchain) {
      throw new Error('blockchain is required');
    }

    this.client = new Twitter({
      access_token_key,
      access_token_secret,
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET
    });
    this.blockchain = blockchain;
  }

  _getHashTag() {
    return String(this.blockchain.hashtag)
      .toLowerCase()
      .replace('#', '');
  }

  async userTimeline(profileId, opt = {}) {
    const params = {
      user_id: profileId,
      tweet_mode: 'extended',
      count: 200,
      exclude_replies: true,
      include_rts: false,
      ...opt
    };
    const url = `${API_URL}/1.1/statuses/user_timeline.json`;
    const hashtag = this._getHashTag();
    const tweets = await this.client.get(url, params);

    if (!Array.isArray(tweets)) {
      throw new Error('Not found');
    }

    return tweets.filter((tweet) => {
      const userID = tweet.user.id_str;

      if (!tweet.entities || tweet.entities.length < 1) {
        return false;
      }

      const hashtags = tweet.entities.hashtags;

      return hashtags.some(
        (tag) => String(tag.text).toLowerCase() === hashtag
      ) && userID === profileId;
    });
  }

  async showTweet(id, opt = {}) {
    const params = {
      id,
      tweet_mode: 'extended',
      exclude_replies: true,
      include_rts: false,
      ...opt
    };
    const hashtag = this._getHashTag();
    const url = `${API_URL}/1.1/statuses/show.json`;
    const tweet = await this.client.get(url, params);

    const hasHashtag = tweet
      .entities
      .hashtags
      .some((tag) => String(tag.text).toLowerCase() === hashtag);

    return {
      tweet,
      hasHashtag
    };
  }
}
