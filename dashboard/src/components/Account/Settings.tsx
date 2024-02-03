import React, { useEffect, useState } from 'react';
import { Anchor, Button, Code, Group, Image, Modal, Tabs, Stack, Textarea, Text } from '@mantine/core';
import AccountPanel from './AccountPanel';
import TeamPanel from './TeamPanel';
import APIKeysPanel from './APIKeysPanel';

const Settings = () => {
  return (
    <Tabs defaultValue="account">
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
