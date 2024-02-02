import React from 'react';
import { Anchor, Code, Image, Stack } from '@mantine/core';
import classes from './MainLayout.module.css';

const LogoComponent = () => {
  return (
    <Stack className={classes.logoStack} align="center" justify="space-between">
      <Anchor href="/" className={classes.logoAnchor}>
      <Image src="/ThisIsNotADrill_cutout.png" h={150} />
      </Anchor>
      <div className={classes.versionContainer}>
        <Code fw={700}>v1.0</Code>
      </div>
    </Stack>
  );
}

export default LogoComponent;
