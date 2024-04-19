import React, { useEffect, useState } from 'react';
import { Anchor, Button, Text } from '@mantine/core';
import { useLocation } from 'react-router-dom';

import { UserButton, UserProfile } from "@clerk/clerk-react"
import classes from './css/Settings.module.css';
import { IconArrowLeft, IconReceipt, IconEdit, IconCopy } from '@tabler/icons-react';

import { TermsOfService } from "./TermsOfService";
import { Billing } from "./Billing";

const AccountPanel = () => {

  useEffect(() => {
    if (import.meta.env.VITE_IS_DEMO_SITE === 'true') {
      const styleLink = document.createElement('style');
      styleLink.type = 'text/css';
      styleLink.innerHTML = '.cl-profilePage__security, .cl-profileSection__emailAddresses { display: none; }';
      document.head.appendChild(styleLink);
    }
  }, []);


  return (
      <div className={classes.account} >
          <UserProfile path="virtual">
            <UserProfile.Page label="Terms of Service" labelIcon={<IconCopy />} url="tos">
              <TermsOfService />
            </UserProfile.Page>
            <UserProfile.Page label="Billing" labelIcon={<IconCopy />} url="billing">
              <Billing />
            </UserProfile.Page>
          </UserProfile>
      </div>
  );
}


export default AccountPanel;
