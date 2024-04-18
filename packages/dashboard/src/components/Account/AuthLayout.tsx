import React from 'react';
import classes from './css/AuthLayout.module.css';
import { IconArrowElbowRight,
         IconEdit,
         IconTrash
       } from '@tabler/icons-react';
import { Anchor, Card, Code, Image, Text, Title } from '@mantine/core';


const AuthLayout:React.FC<{children: React.ReactNode, imageUrl: string }> = ({children, imageUrl}) => {
 
  return (
    <div className={classes.authContainer}>
    <div className={classes.leftColumn} style={{ backgroundImage: `url(${imageUrl})` }}>
    {/* This div will have the background image */}
    </div>
    <div className={classes.rightColumn}>
    <div className={classes.authComponents}>
    {children} {/* This will render SignIn or SignUp components */}
    </div>
    { import.meta.env.VITE_IS_DEMO_SITE === 'true' && (
      <>
        <Card style={{marginLeft:'20px'}}>
          <Title style={{marginBottom:'5px',fontStyle:'italic'}} order={5}>Login Info for this demo site:</Title>
          <Image  src="demoUserPass2.png" />
        </Card>
        <br />
        <Title order={6}>If you are seeing this signin page in an iframe, click <Anchor target="_blank" href="/">here</Anchor> to break out before logging in.</Title>
      </>
    )}
    {/*
        <div className={classes.customerNameplates}>
        Trusted by these brands:
        <span className={classes.brandLogo}><IconEdit /></span>
        <span className={classes.brandLogo}><IconTrash /></span>
        </div>
        <Anchor href="/help" underline="never" size="md" className={classes.learnMore}>Learn more about what we do!</Anchor>
      */}
    </div>
    </div>
  );
};

export default AuthLayout;
