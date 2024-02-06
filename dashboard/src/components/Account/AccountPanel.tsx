import React, { useEffect, useState } from 'react';
import { Anchor, Button, Text } from '@mantine/core';
import { useLocation } from 'react-router-dom';

import { UserButton, UserProfile } from "@clerk/clerk-react"
import classes from './Settings.module.css';
import { IconArrowLeft, IconReceipt, IconEdit, IconCopy } from '@tabler/icons-react';

import { Billing } from "./Billing";
import { TermsOfService } from "./TermsOfService";

const AccountPanel = () => {

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
