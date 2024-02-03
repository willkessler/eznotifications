import React, { useEffect, useState } from 'react';
import { Anchor, Button, Text } from '@mantine/core';
import { UserButton, UserProfile } from "@clerk/clerk-react"
import classes from './Account.module.css';
import { IconArrowLeft } from '@tabler/icons-react';

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
        <UserButton />
      <Anchor onClick={triggerUserButtonClick} className={classes.accountAnchor}>
          Manage Account
        </Anchor>
    </div>
    <div className={classes.payment} >
      <Anchor className={classes.paymentAnchor} href="http://stripe.com">Manage Billing</Anchor>
    </div>
  </>
  );
}


export default AccountPanel;
