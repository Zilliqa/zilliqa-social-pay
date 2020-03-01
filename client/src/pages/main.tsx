import React from 'react';

import { Container } from 'src/components/container';

export const MainPage: React.FC = () => {
  const [address, setAddress] = React.useState();

  const handleLogin = React.useCallback(() => {
    window.open(`http://localhost:4000/auth/twitter?address${address}`, "_self");
  }, [address]);
  const handleSignInClick = React.useCallback(() => {
    window.open("http://localhost:4000/auth/logout", "_self");
  }, []);
  const handleInput = React.useCallback((event) => {
    const target = event.target as HTMLInputElement;

    setAddress(target.value);
  }, [setAddress]);

  return (
    <Container>
      <input
        type="text"
        placeholder="address (zil1)"
        onInput={handleInput}
      />
      <button onClick={handleLogin}>
        login
      </button>
      <button onClick={handleSignInClick}>
        logout
      </button>
    </Container>
  );
};

export default MainPage;
