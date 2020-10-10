const ERROR_CODES = require('../../config/error-codes');
const END_OF_CAMPAIGN = process.env.END_OF_CAMPAIGN;

module.exports = function (req, res, next) {
  const campaignEnd = new Date(END_OF_CAMPAIGN);
  const now = new Date();
  const difference = campaignEnd.valueOf() - now.valueOf();

  req.campaign = {
    now,
    end: campaignEnd
  };

  if (difference <= 0) {
    return res.status(208).json({
      code: ERROR_CODES.campaignDown,
      message: 'Campaign has ended!'
    });
  }

  next();
}
