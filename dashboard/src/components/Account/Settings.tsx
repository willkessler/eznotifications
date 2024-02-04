import React, { useEffect, useState } from 'react';
import { Anchor, Button, Code, Group, Image, Modal, Tabs, Stack, Textarea, Text } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import AccountPanel from './AccountPanel';
import TeamPanel from './TeamPanel';
import APIKeysPanel from './APIKeysPanel';

const tabMapping = {
  '/settings/account': 'account',
  '/settings/billing': 'billing',
  '/settings/team': 'team',
  '/settings/apikeys': 'apiKeys',
  '/settings/tos': 'account' // Redirect to account but we handle showing TOS inside AccountPanel differently
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
        <Tabs.Tab value="account">My Account</Tabs.Tab>
        <Tabs.Tab value="team">Organization / Team</Tabs.Tab>
        <Tabs.Tab value="apiKeys">API Keys</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="account">
        <AccountPanel />
      </Tabs.Panel>

      <Tabs.Panel value="team">
        <TeamPanel />
      </Tabs.Panel>

      <Tabs.Panel value="apiKeys">
        <APIKeysPanel />
      </Tabs.Panel>
    </Tabs>
  );
}

export default Settings;
