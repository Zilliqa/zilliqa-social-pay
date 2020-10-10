const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

module.exports = async function (req, res, next) {

  req.recaptcha = {
    RECAPTCHA_SITE_KEY
  };

  next();
}
