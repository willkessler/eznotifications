import React, { useEffect, useState } from 'react';
import { Anchor, Button, Image, Modal, Space, Stack, Text, Title } from '@mantine/core';
import mainClasses from './css/MainLayout.module.css';
import navClasses from './css/Navbar.module.css';
import { useSettings } from '../Account/SettingsContext';

// Define the step type explicitly, including the Placement type for the placement property
type Placement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';

interface Step {
  target: string;
  content: string;
  disableBeacon: boolean;
  placement: Placement; // Use the Placement type here
  locale?: {
    skip: React.ReactNode;
  };
}

const Tutorial = () => {

  const { createdLocalUser, createdLocalOrg } = useSettings();
  const [ isTutorialModalOpen, setIsTutorialModeOpen ] = useState(false);
  
  useEffect(() => {
    setIsTutorialModeOpen(createdLocalUser || createdLocalOrg);
  }, [createdLocalUser, createdLocalOrg]);

  const getStarted = () => {
    setIsTutorialModeOpen(false);
  };
  
  const closeTutorialModal = () => {
    setIsTutorialModeOpen(false);
  }

  return (
    <>
      <Modal.Root size="lg"
        opened={isTutorialModalOpen}
        onClose={closeTutorialModal} 
        closeOnClickOutside={false}
        radius="xl"
        centered 
        padding="lg">
        <Modal.Overlay />
        <Modal.Content style={{ marginLeft:'20px', minWidth:'90vw',  maxWidth:'90vw'}} >
            <Modal.Header>
              <Modal.Title style={{fontSize:'24px', fontWeight:'800', color:'#d33'}}>
                <Image src="/ThisIsNotADrill_cutout.png" w={120} />
              </Modal.Title>
              <Stack align="flex-start" gap="sm">
                <Title order={3}>Welcome{ (!createdLocalOrg && createdLocalUser) && (<>, team member</>)}!</Title>
                <Text><span style={{fontStyle:'italic',fontWeight:'bold'}}>This Is Not A Drill! </span> makes it dead simple to set up immediate, critical, or scheduled notices to users, with zero deployments.</Text>
                  { (createdLocalOrg) && (
                    <Text>Watch a basic walkthrough below (if you like), then, click <i>Let's Get Started</i>.</Text>
                  )}
                  { ((!createdLocalOrg && createdLocalUser)) && (
                    <Text>
                      Your teammate has invited you to help manage this service, which makes it dead simple to show immediate, critical,
                      or scheduled notices to users, without code deploys.
                    </Text>
                    )}

              </Stack>
            </Modal.Header>
            <Modal.Body style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
              <div style={{ flex: 1, minHeight: '0', position:'relative' }}>
                { (createdLocalOrg) && (
                        <iframe src="https://www.loom.com/embed/0ff3df6af4744f72917f1ffb4d1f597b?sid=9d58f8ba-9ea7-42ab-81ed-0463a2696762" 
                          frameBorder="0" 
                          allowFullScreen 
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} >
                        </iframe>
                  )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop:'10px', padding: '10px' }}>
                  <Button onClick={() => { getStarted() }}>Let's Get Started</Button>
              </div>
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>

    </>
  );

};

export default Tutorial;
