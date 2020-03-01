import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components'

import { AppRoutes } from 'src/app-routes';

const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
  }

  * {
    box-sizing: border-box;
  }
`

export const App: React.FC = () => {
  return (
    <React.Fragment>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <GlobalStyle />
    </React.Fragment>
  );
}

export default App;
