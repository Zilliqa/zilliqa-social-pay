const router = require('express').Router();
const { validation } = require('@zilliqa-js/util');

const models = require('../models');
const User = models.sequelize.models.User;

router.put('/update/address/:address', async (req, res) => {
  const bech32Address = req.params.address;
  const jwtToken = req.headers.authorization;

  if (!validation.isBech32(bech32Address)) {
    return res.status(401).json({
      message: 'Invalid address format.'
    });
  }

  try {
    const user = new User;
    const decoded = await user.verify(jwtToken);

    await User.update({
      zilAddress: bech32Address
    }, {
      where: { id: decoded.id }
    });
  
    return res.status(200).json({
      ...decoded,
      zilAddress: bech32Address
    });
  } catch (err) {
    return res.status(501).json({
      message: err.message
    });
  }
});

module.exports = router;
