import React, { useEffect, useState } from 'react';
import { Anchor, Button, Code, Group, Image, Modal, Tabs, Stack, Textarea, Text } from '@mantine/core';
import classes from './Settings.module.css';

const APIKeysPanel = () => {
  return (
      <div className={classes.team} >
        <Text size="xl">Manage Your API Keys</Text>
      </div>
  );
}

export default APIKeysPanel;
