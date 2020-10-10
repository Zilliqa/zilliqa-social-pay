require('dotenv').config();

const passport = require('passport');
const TwitterTokenStrategy = require('passport-twitter-token');

const models = require('./models');

const DAYS_TO_KILL = process.env.DAYS_TO_KILL || 30;

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
passport.serializeUser((user, done) => {
  done(null, user);
});

// deserialize the cookieUserId to user in the database
passport.deserializeUser((user, done) => {
  if (!user.id || !user.username || !user.profileId) {
    done(new Error('Incorect user object'));

    return null;
  }

  done(null, user);
});

passport.use(
  new TwitterTokenStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET
    },
    (token, tokenSecret, profile, done) => {
      const { statuses } = new models.sequelize.models.User();
      let status = statuses.enabled;
      const oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
      const firstDate = new Date();
      const secondDate = new Date(profile._json.created_at);
      const diffDays = Math.round(
        Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay))
      );

      if (Number(diffDays) < Number(DAYS_TO_KILL)) {
        status = statuses.baned;
      }

      models
        .sequelize
        .models
        .User
        .findOrCreate({
          where:{
            profileId: profile._json.id_str
          },
          defaults: {
            token,
            tokenSecret,
            status,
            username: profile.username,
            profileId: profile.id,
            screenName: profile._json.screen_name,
            profileImageUrl: profile._json.profile_image_url_https
          },
          attributes: {
            exclude: [
              'tokenSecret',
              'token'
            ]
          }
        })
        .then(([user]) => done(null, user))
        .catch((err) => done(err, null));
    }
  )
);
