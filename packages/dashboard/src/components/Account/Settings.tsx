import React, { useEffect, useState } from 'react';
import { Anchor, Button, Code, Group, Image, Modal, Tabs, Stack, Textarea, Text } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import AccountPanel from './AccountPanel';
import OrgAndTeamPanel from './OrgAndTeamPanel';
import AppConfigPanel from './AppConfigPanel';

type TabMappingKey = 
    '/settings/account' |
    '/settings/billing' |
    '/settings/team' |
    '/settings/tos' |
    '/settings/app-config';

const tabMapping: { [key in TabMappingKey]: string } = {
  '/settings/account': 'account',
  '/settings/billing': 'billing',
  '/settings/team': 'team',
  '/settings/tos': 'account', // Redirect to account but we handle showing TOS inside AccountPanel differently
  '/settings/app-config' : 'appConfig',
};

const defaultTab = 'account';

const Settings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentTabKey = location.pathname as TabMappingKey;
    const currentTab = 
        Object.keys(tabMapping).includes(location.pathname) ? 
        tabMapping[location.pathname as TabMappingKey] : 
        defaultTab;

  // When a tab is selected, change the URL
  const handleTabChange = (value: string | null) => {
      const url = Object.keys(tabMapping).find((key): key is TabMappingKey => tabMapping[key as TabMappingKey] === value);
      if (url === undefined) {
          console.error ('No tab found for the given value:', value);
          const defaultUrl = 
              Object.keys(tabMapping).find((key): key is TabMappingKey => tabMapping[key as TabMappingKey] === defaultTab);
          if (defaultUrl !== undefined) {
              navigate(defaultUrl);
          } else {
              console.error('Default URL not found. Unable to navigate.');
          }
      } else {
          navigate(url);
      }
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
