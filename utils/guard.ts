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

  if (req.cookies && (req.cookies['session.sig'] || req.cookies.session)) {
    firstStart = false;
  }

  if (!req.session || !req.session.passport) {
    if (req.url === '/') {
      res.redirect('/redcross');
    }

    return {
      firstStart,
      user,
      isServer
    };
  }

  user = req.session.passport.user;

  return {
    firstStart,
    user,
    isServer
  };
}
