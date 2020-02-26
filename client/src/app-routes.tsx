import React from 'react';
import { Switch, Route } from 'react-router';

import { AuthPage } from 'src/pages/auth';
import { MainPage } from 'src/pages/main';

export const AppRoutes: React.FC = () => (
  <Switch>
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
