const Twitter = require('twitter');

const API_URL = 'https://api.twitter.com';

module.exports = class {
  constructor(access_token_key, access_token_secret, blockchain) {
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
      count: 100,
      ...opt
    };
    const url = `${API_URL}/1.1/statuses/user_timeline.json`;
    const hashtag = this._getHashTag();
    const tweets = await this.client.get(url, params);

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

  async showTweet(opt = {}) {
    const params = {
      id: query,
      tweet_mode: 'extended',
      ...opt
    };
    const hashtag = this._getHashTag();
    const url = `${API_URL}/1.1/statuses/show.json`;
    const tweet = await client.get(url, params);

    const hasHashtag = tweet
      .entities
      .hashtags
      .some((tag) => String(tag.text).toLowerCase() === hashtag);

    if (!hasHashtag) {
      return null;
    }

    return tweet;
  }
}
