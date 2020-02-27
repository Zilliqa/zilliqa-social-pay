const passport = require('passport');
const TwitterStrategy = require('passport-twitter');

const models = require('./models');

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// deserialize the cookieUserId to user in the database
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(e => {
      done(new Error('Failed to deserialize an user'));
    });
});

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: '/auth/twitter/redirect'
    },
    (token, tokenSecret, profile, done) => {
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
            username: profile.username,
            profileId: profile.id,
            screenName: profile._json.screen_name,
            profileImageUrl: profile._json.profile_image_url
          }
        })
        .then(([user]) => done(null, user))
        .catch((err) => done(err, null));
    }
  )
);
