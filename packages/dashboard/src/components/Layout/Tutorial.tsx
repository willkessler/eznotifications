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
        <Modal.Content style={{ minWidth:'95%'}} >
            <Modal.Header>
              <Modal.Title style={{fontSize:'24px', fontWeight:'800', color:'#d33'}}>
                <Image src="/ThisIsNotADrill_cutout.png" w={120} />
              </Modal.Title>
              <Stack>
                <Title order={3}>Welcome{ (!createdLocalOrg && createdLocalUser) && (<>, team member</>)}!</Title>
              <Text><span style={{fontStyle:'italic',fontWeight:'bold'}}>This Is Not A Drill! </span> makes it dead simple to set up immediate, critical, or scheduled notices to users, without zero deployments. Watch a basic walkthrough below (if you like), then, click <i>Let's Get Started</i>.</Text>
              </Stack>
            </Modal.Header>
            <Modal.Body>

              <div style={{marginBottom:'10px'}}>
                { (createdLocalOrg) && (
                  <>
                    <div style={{position: 'relative', paddingBottom: '56.25%', height:0 }}>
                      <iframe src="https://www.loom.com/embed/0ff3df6af4744f72917f1ffb4d1f597b?sid=9d58f8ba-9ea7-42ab-81ed-0463a2696762" 
                        frameBorder="0" 
                        allowFullScreen 
                        style={{position: 'absolute', top:0, left:0, width:'100%', height: '100%' }} >
                      </iframe>
                    </div>
                  </>
                )}
                { (!createdLocalOrg && createdLocalUser) && (
                  <>
                  <p>Your teammate has invited you to help manage this service, which makes it dead simple to show immediate, critical,
                or scheduled notices to users, <span style={{fontWeight:'bold'}}>without deploying code</span>.</p>
                  <p>But first, why not take the (literally) 30-second tour?</p>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems:'center', marginTop:'30px' }}>
                <Button onClick={() => { getStarted() }}>Let's Get Started</Button>
              </div>
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>

    </>
  );

};

export default Tutorial;
