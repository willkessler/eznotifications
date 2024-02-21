import React from 'react';
import { Anchor, Code, Image, Stack } from '@mantine/core';
import classes from './css/MainLayout.module.css';
import { useMediaQuery } from '@mantine/hooks';

const LogoComponent = () => {
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const logoSize = (isSmallScreen ? 120 : 155);

  return (
    <Stack className={classes.logoStack} align="center" justify="space-between">
      <Anchor href="/" className={classes.logoAnchor}>
        <Image src="/ThisIsNotADrill_cutout.png" w={logoSize} />
      </Anchor>
    </Stack>
  );
}

export default LogoComponent;
