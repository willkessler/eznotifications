import { Anchor, Button, Card, Group, Image , Title } from '@mantine/core';
import '@mantine/core/styles.css';
import classes from '../App.module.css'; // Adjust the path as necessary
import {
    IconBook,
    IconRecycle,
} from '@tabler/icons-react';

const DemoControls = ({isOpen, onClose}) => {
  return (
    <>
       <Card shadow="sm" radius="md" p="xs" withBorder className={classes.demoControls}>
          <Group justify="flex-start" align="center">
          <a href="this-is-not-a-drill.com">
          <Image
            pe="xs"
            h={70}
            src="ThisIsNotADrill_cutout.png" />
          <Title order={5}>TINAD Control Panel</Title>
          <Anchor><IconRecycle />Reset Views</Anchor>
          <Anchor><IconBook />View Docs</Anchor>
          </Group>
        </Card>
    </>
  );
}

export default DemoControls;
