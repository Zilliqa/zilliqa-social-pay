import React from 'react';
import { Switch, Route } from 'react-router';

import { AuthPage, AuthPagePath } from 'src/pages/auth';
import { MainPage, MainPagePath } from 'src/pages/main';
import { GuidePage, GuidePagePath } from 'src/pages/guide';

export const AppRoutes: React.FC = () => (
  <Switch>
    <Route
      path={GuidePagePath}
      component={GuidePage}
      exact
    />
    <Route
      path={AuthPagePath}
      component={AuthPage}
      exact
    />
    <Route
      path={MainPagePath}
      component={AuthPage}
      exact
    />
  </Switch>
);

export default AppRoutes;
