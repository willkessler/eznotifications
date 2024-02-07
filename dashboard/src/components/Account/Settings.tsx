import React, { useEffect, useState } from 'react';
import { Anchor, Button, Code, Group, Image, Modal, Tabs, Stack, Textarea, Text } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import AccountPanel from './AccountPanel';
import OrgAndTeamPanel from './OrgAndTeamPanel';
import AppConfigPanel from './AppConfigPanel';

const tabMapping = {
  '/settings/account': 'account',
  '/settings/billing': 'billing',
  '/settings/team': 'team',
  '/settings/tos': 'account', // Redirect to account but we handle showing TOS inside AccountPanel differently
  '/settings/app-config' : 'appConfig',
};

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = tabMapping[location.pathname];

  // When a tab is selected, change the URL
  const handleTabChange = (value) => {
    const url = Object.keys(tabMapping).find(key => tabMapping[key] === value);
    navigate(url);
  };  
  
  return (
    <Tabs value={currentTab} onChange={handleTabChange}>
      <Tabs.List justify="left">
        <Tabs.Tab value="account">Your Account</Tabs.Tab>
        <Tabs.Tab value="team">Your Team</Tabs.Tab>
        <Tabs.Tab value="appConfig">Configuration</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="account">
        <AccountPanel />
      </Tabs.Panel>

      <Tabs.Panel value="team">
        <OrgAndTeamPanel />
      </Tabs.Panel>

      <Tabs.Panel value="appConfig">
        <AppConfigPanel />
      </Tabs.Panel>
    </Tabs>
  );
}

export default Settings;
