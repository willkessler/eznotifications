import React from 'react';
import classes from './css/AuthLayout.module.css';
import { Anchor } from '@mantine/core';
import { IconArrowElbowRight,
         IconEdit,
         IconTrash
       } from '@tabler/icons-react';
import { Card, Code, Image, Title } from '@mantine/core';


const AuthLayout:React.FC<{children: React.ReactNode, imageUrl: string }> = ({children, imageUrl}) => (
  <div className={classes.authContainer}>
    <div className={classes.leftColumn} style={{ backgroundImage: `url(${imageUrl})` }}>
      {/* This div will have the background image */}
    </div>
    <div className={classes.rightColumn}>
      <div className={classes.authComponents}>
        {children} {/* This will render SignIn or SignUp components */}
      </div>
      { import.meta.env.VITE_IS_DEMO_SITE === 'true' && (
        <Card style={{marginLeft:'20px'}}>
          <Title style={{marginBottom:'5px',fontStyle:'italic'}} order={5}>Login Info for this demo site:</Title>
          <Image w={180} src="demoUserPass.png" />
        </Card>
      )}
      <div className={classes.customerNameplates}>
        {/* Customer nameplates and icons */}
        Trusted by these brands:
          <span className={classes.brandLogo}><IconEdit /></span>
          <span className={classes.brandLogo}><IconTrash /></span>
      </div>
      <Anchor href="/help" underline="never" size="md" className={classes.learnMore}>Learn more about what we do!</Anchor>
    </div>
  </div>
);

export default AuthLayout;
