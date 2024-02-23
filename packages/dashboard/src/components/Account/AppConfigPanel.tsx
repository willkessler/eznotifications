import React, { useEffect, useState } from 'react';
import { Anchor, Button, Text } from '@mantine/core';
import { useLocation } from 'react-router-dom';
import classes from './css/Settings.module.css';
import { IconArrowLeft, IconReceipt, IconEdit, IconCopy } from '@tabler/icons-react';
import APIKeysPanel from './APIKeysPanel';
import GlobalSettingsPanel from './GlobalSettingsPanel';

const AppConfigPanel = () => {

  return (
    <>
      <GlobalSettingsPanel />
      <APIKeysPanel />
    </>
  );
}


export default AppConfigPanel;
