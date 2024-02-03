import React, { useEffect, useState } from 'react';
import { Anchor, Button, Code, Group, Image, Modal, Tabs, Stack, Textarea, Text } from '@mantine/core';
import classes from './Settings.module.css';

const TeamPanel = () => {
  return (
      <div className={classes.team} >
        <Text size="xl">Your Team</Text>
      </div>
  );
}

export default TeamPanel;
