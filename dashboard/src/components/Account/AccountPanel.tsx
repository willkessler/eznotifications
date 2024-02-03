import React, { useEffect, useState } from 'react';
import { Anchor, Button, Text } from '@mantine/core';
import { UserButton, UserProfile } from "@clerk/clerk-react"
import classes from './Settings.module.css';
import { IconArrowLeft, IconReceipt } from '@tabler/icons-react';

const AccountPanel = () => {
  const triggerUserButtonClick = () => {
    console.log('triggered');
    const iconElement = document.querySelector('.cl-userButtonTrigger');
  
    if (iconElement) {
      iconElement.click(); // Programmatically clicks the icon element
    } else {
      console.error('Icon element not found');
    }
  };  

  return (
    <>
      <div className={classes.account} >
        <Text size="xl">Manage Your Account</Text>
      </div>
      <div className={classes.account} >
        <UserButton />
        <Anchor c="#999" onClick={triggerUserButtonClick} className={classes.accountAnchor} >
          Account Details
        </Anchor>
      </div>
      <div className={classes.payment} >
        <IconReceipt />
        <Anchor c="#999" className={classes.paymentAnchor} href="http://stripe.com">Payment Details</Anchor>
      </div>
    </>
  );
}


export default AccountPanel;
