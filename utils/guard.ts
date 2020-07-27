const STATUS = 200;

export function authGuard({ res, req }: any) {
  if (!req || !res) {
    return null;
  }

  let firstStart = true;
  let user = null;

  //
  // Use getInitialProps as a step in the lifecycle when
  // we can initialize our store
  //
  const isServer = typeof window === 'undefined';
  const campaignEnd = new Date(req.blockchainInfo.campaignEnd).valueOf();
  const now = new Date(req.blockchainInfo.now).valueOf();
  const diff = campaignEnd - now;

  if (diff <= 0 && req.url !== '/end') {
    res.status(STATUS).redirect('/end');
    res.end();

    return {
      firstStart,
      user,
      isServer,
      blockchainInfo: req.blockchainInfo,
      recaptcha: req.recaptcha
    };
  } else if (req.url === '/end' && diff > 0) {
    // res.status(STATUS).redirect('/zil3');
  }

  if (req.cookies && (req.cookies['session.sig'] || req.cookies.session)) {
    firstStart = false;
  }

  if (!req.session || !req.session.passport) {
    if (req.url === '/') {
      res.status(STATUS).redirect('/zil3');
    }

    return {
      firstStart,
      user,
      isServer,
      blockchainInfo: req.blockchainInfo,
      recaptcha: req.recaptcha
    };
  }

  user = req.session.passport.user;

  return {
    firstStart,
    user,
    isServer,
    blockchainInfo: req.blockchainInfo,
    recaptcha: req.recaptcha
  };
}
