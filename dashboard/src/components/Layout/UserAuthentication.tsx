import React from 'react';
import { Anchor, Button, Code, Image, Stack } from '@mantine/core';
import classes from './MainLayout.module.css';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

const UserAuthentication = () => {
  const { login, logout, register, user, isAuthenticated, isLoading } = useKindeAuth();
  if (isAuthenticated) {
    return (
      <>
        Authenticated: {}
        <div>
	  <h2>{user.given_name}</h2>
	  <p>{user.email}</p>
	</div>
        <Button onClick={logout} type="button">Sign out</Button>
      </>
    );
  } else {
    return (
      <>
	<p>Please sign in or register!</p>

        <Button onClick={register} type="button">Sign up</Button>
        <Button onClick={login} type="button">Sign in</Button>
      </>
    )
  };
}

export default UserAuthentication;
