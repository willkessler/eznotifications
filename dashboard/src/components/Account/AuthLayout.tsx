import React from 'react';
import classes from './AuthLayout.module.css';
import { Anchor } from '@mantine/core';
import { IconArrowElbowRight, 
         IconEdit, 
         IconTrash
       } from '@tabler/icons-react';


const AuthLayout = ({ children, imageUrl }) => (
  <div className={classes.authContainer}>
    <div className={classes.leftColumn} style={{ backgroundImage: `url(${imageUrl})` }}>
      {/* This div will have the background image */}
    </div>
    <div className={classes.rightColumn}>
      <div className={classes.authComponents}>
        {children} {/* This will render SignIn or SignUp components */}
      </div>
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
