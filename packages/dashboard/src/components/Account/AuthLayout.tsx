import React from 'react';
import classes from './css/AuthLayout.module.css';
import { IconArrowElbowRight,
         IconEdit,
         IconTrash,
         IconCopy,
         IconCheck,
       } from '@tabler/icons-react';
import { ActionIcon, Anchor, Button, Card, Code, CopyButton, rem, Tooltip, Image, List, Text, Title } from '@mantine/core';


const AuthLayout:React.FC<{children: React.ReactNode, imageUrl: string }> = ({children, imageUrl}) => {
 
  return (
    <div className={classes.authContainer}>
      <div className={classes.leftColumn} style={{ backgroundImage: `url(${imageUrl})` }}>
        {/* This div will have the background image */}
      </div>
      <div className={classes.rightColumn}>
        { 
          import.meta.env.VITE_IS_DEMO_SITE === 'true' && (
            <>
              <Card style={{margin:'10px'}}>
                <Title style={{marginBottom:'5px'}} order={2}>Demo Site: This Is Not A Drill!</Title>
                <Text size="lg" style={{paddingTop:'10px',fontStyle:'italic'}}>Please Note: This demo is best viewed on a laptop.</Text>
              </Card>
              <br />
            </>
          )
        }
        <div className={classes.authComponents}>
          {children} {/* This will render SignIn or SignUp components */}
        </div>
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
