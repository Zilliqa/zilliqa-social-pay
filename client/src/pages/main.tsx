import React from 'react';

export const MainPage: React.FC = () => {
  const handleLogin = React.useCallback(() => {
    window.open("http://localhost:4000/auth/twitter", "_self");
  }, []);
  const handleSignInClick = React.useCallback(() => {
    window.open("http://localhost:4000/auth/logout", "_self");
  }, []);

  return (
    <div>
      <button onClick={handleLogin}>
        login
      </button>
      <button onClick={handleSignInClick}>
        logout
      </button>
    </div>
  );
};

export default MainPage;
