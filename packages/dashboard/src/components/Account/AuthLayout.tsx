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
        <div className={classes.authComponents}>
          {children} {/* This will render SignIn or SignUp components */}
        </div>
        { import.meta.env.VITE_IS_DEMO_SITE === 'true' && (
            <>
              <Card style={{marginLeft:'10px'}}>
                <Title style={{marginBottom:'5px',fontStyle:'italic'}} order={5}>How to log in to the demo:</Title>
                <List style={{paddingRight:'15px'}}>
                  <List.Item>Use <Code>demo@this-is-not-a-drill.com</Code> for the email address.</List.Item>
                  <List.Item>Copy the password to your clipboard by clicking this icon:
                    <CopyButton value="#tinad1#" timeout={2000}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied password!' : 'Copy'} withArrow position="right">
                          <ActionIcon color={copied ? '#333' : 'gray'} variant="subtle" onClick={copy} style={{color:'#fff'}}>
                            {copied ? (
                              <IconCheck style={{ width: rem(20) }} />
                            ) : (
                              <IconCopy style={{ width: rem(20) }} />
                            )}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                    (and then paste it in once you see the password field)
                  </List.Item>
                </List>
              </Card>
              <br />
              <Text>If you are seeing this signin page in an iframe, please click <Anchor target="_blank" href="/">here</Anchor> before logging in.</Text>
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
