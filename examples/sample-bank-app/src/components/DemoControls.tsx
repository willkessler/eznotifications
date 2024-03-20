import { Anchor, Card, Group, Image , Title } from '@mantine/core';
import '@mantine/core/styles.css';
import classes from '../css/MainLayout.module.css'; // Adjust the path as necessary
import { getTinadSDKConfig, useSDKData } from '@this-is-not-a-drill/react-core';
import {
    IconBook,
    IconRecycle,
    IconMovie,
} from '@tabler/icons-react';

const DemoControls = () => {
  const { reset: resetCore, pageId } = useSDKData();
  const handleResetAllViews = async () => {
    // Call the core to reset all views. this may mess up if the user is right in the middle of a chain of notifs.
    console.log('Executing resetAllViews.');
    
    try {
      await resetCore(pageId);
      console.log('Views reset successfully');
    } catch (error) {
      console.log('Failed to reset views:', error);
    }
  };
  
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
      <IconRecycle style={{color:'#000', marginLeft:'15px'}} /><Anchor onClick={handleResetAllViews} style={{marginLeft:'-8px', color:'#000'}}>Reset Views</Anchor>
          <IconBook style={{color:'#000', marginLeft:'15px'}} /><Anchor style={{marginLeft:'-8px', color:'#000'}}>Help/Docs</Anchor>
          </Group>
        </Card>
    </>
  );
}

export default DemoControls;
