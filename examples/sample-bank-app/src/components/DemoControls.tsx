import { Anchor, Card, Group, Image , Title } from '@mantine/core';
import '@mantine/core/styles.css';
import classes from '../css/MainLayout.module.css'; // Adjust the path as necessary
import {
    IconBook,
    IconRecycle,
    IconMovie,
} from '@tabler/icons-react';

const DemoControls = () => {
  return (
    <>
       <Card shadow="sm" radius="md" p="xs" withBorder className={classes.demoControls}>
          <Group justify="flex-start" align="center" gap="xs">
          <a href="https://this-is-not-a-drill.com" target="_blank">
          <Image
            pe="xs"
            h={70}
            src="ThisIsNotADrill_cutout.png" />
          </a>
          <Title order={6}><span style={{fontStyle:'italic'}}>This is Not a Drill!</span><br />Control Panel</Title>
          <IconMovie style={{color:'#000', marginLeft:'15px'}} /><Anchor style={{marginLeft:'-8px', color:'#000'}}>Watch Tutorial</Anchor>
          <IconRecycle style={{color:'#000', marginLeft:'15px'}} /><Anchor style={{marginLeft:'-8px', color:'#000'}}>Reset Views</Anchor>
          <IconBook style={{color:'#000', marginLeft:'15px'}} /><Anchor style={{marginLeft:'-8px', color:'#000'}}>Help/Docs</Anchor>
          </Group>
        </Card>
    </>
  );
}

export default DemoControls;
