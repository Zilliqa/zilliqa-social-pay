const request = require('request');

const ERROR_CODES = require('../../config/error-codes');
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

const VERIFICATION_URL = 'https://www.google.com/recaptcha/api/siteverify';

const checkRecaptcha = (recaptcha, remoteAddress) => new Promise((resolve, reject) => {
  const url = `${VERIFICATION_URL}?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptcha}&remoteip=${remoteAddress}`;

  console.log(url)

  request(url, (error, response, body) => {
    if (error) {
      return reject(error)
    }

    body = JSON.parse(body);

    if (body.success) {
      return resolve(body)
    }

    return reject(body)
  });
});

module.exports = async function (req, res, next) {
  const { recaptcha } = req.headers;
  const { remoteAddress } = req.connection

  try {
    await checkRecaptcha(recaptcha, remoteAddress);
  } catch (err) {
    return res.status(400).json({
      code: ERROR_CODES.invalidRecaptcha,
      message: 'Invalid Recaptcha content.'
    });
  }

  next();
}
