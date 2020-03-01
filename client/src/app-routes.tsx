import React from 'react';
import { Switch, Route } from 'react-router';

import { AuthPage } from 'src/pages/auth';
import { MainPage } from 'src/pages/main';
import { Guide } from 'src/pages/guide';

export const AppRoutes: React.FC = () => (
  <Switch>
    <Route
      path="/guide"
      exact
      component={Guide}
    />
    <Route
      path="/auth"
      exact
      component={AuthPage}
    />
    <Route
      path="/"
      exact
      component={MainPage}
    />
  </Switch>
);

export default AppRoutes;
