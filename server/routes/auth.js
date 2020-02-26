const expressJwt = require('express-jwt');
const { models } = require('../models').models.sequelize;
const header = 'x-auth-token';

module.exports = expressJwt({
  secret: process.env.JWT_SECRET,
  requestProperty: 'auth',
  async function(req, res) {
    const jwtToken = req.headers[header];

    try {
      const payload = new models.User().verify(jwtToken);
      console.log(payload);
    } catch (err) {
      res.status(401).send('Unauthorized: No token provided');
    }

    return null;
  }
});
