import React, { useEffect, useState } from 'react';
import Joyride from 'react-joyride';
import { Anchor, Button, Image, Modal, Space } from '@mantine/core';
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
  const [ joyrideRunState, setJoyrideRunState ] = useState(false);
  const [ isTutorialModalOpen, setIsTutorialModeOpen ] = useState(false);
  
  useEffect(() => {
    setIsTutorialModeOpen(createdLocalUser || createdLocalOrg);
  }, [createdLocalUser, createdLocalOrg]);

  const takeTheTour = () => {
    setIsTutorialModeOpen(false);
    setJoyrideRunState(true);
  };
  
  const closeTutorialModal = () => {
    setIsTutorialModeOpen(false);
  };

  const steps:Step[] = [
      {
        target: '[data-tour="notifications"]',
        content: 'Start at the Notifications page: create and configure notifications to show your users.', 
        disableBeacon: true,
        placement: 'right-end',
        locale: { skip: <strong aria-label="skip">Skip</strong> },
      },
      {
        target: '[data-tour="sandbox"]',
        content: 'After setting up a notification or two, you can quickly try it out in the sandbox.', 
        disableBeacon: true,
        placement: 'right-end',
      },
      {
        target: '[data-tour="statistics"]',
        content: `Once you're in production, track your Notifications' performance, right down to the individual user.`,
        disableBeacon: true,
        placement: 'right-end',
      },
      {
        target: '[data-tour="account"]',
        content: `Invite others to the dashboard, manage API keys and payment methods here.`,
        disableBeacon: true,
        placement: 'right-end',
      },
      {
        target: '[data-tour="help"]',
        content: `That's pretty much it! If you need help, look here. Have fun!`,
        disableBeacon: true,
        placement: 'right-end',
      },
  ];

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
          <Modal.Content>
            <Modal.Header>
              <Modal.Title style={{fontSize:'24px', fontWeight:'800', color:'#d33'}}>
                <Image src="/ThisIsNotADrill_cutout.png" w={120} />
                Welcome{ (!createdLocalOrg && createdLocalUser) && (<>, team member</>)}!
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div style={{marginBottom:'10px'}}>
                { createdLocalOrg && (
                  <>
                    <p> <span style={{fontStyle:'italic',fontWeight:'bold'}}>This Is Not A Drill! </span>
                      makes it dead simple to set up immediate, critical, or scheduled notices to users, 
                    <span style={{fontWeight:'bold'}}>without deploying code</span>.</p>
                    <p>Why not take the (literally) 30-second tour?</p>
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
                <Anchor onClick={() => { closeTutorialModal() }} style={{ fontStyle:'italic', marginRight:'10px', color:'#999'}}>No thanks, I got this!</Anchor>
                <Button onClick={() => { takeTheTour() }}>Take the 30-second tour!</Button>
              </div>
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>

        <Joyride 
          continuous
          hideCloseButton
          run={joyrideRunState}
          scrollToFirstStep
          showProgress
          showSkipButton
          steps={steps}
          styles={{
            options: {
              zIndex: 10000,
              arrowColor: '#fff',
              backgroundColor: '#fff',
              overlayColor: 'rgba(0, 0, 0, 0.5)',
              primaryColor: '#f04',
              spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
              textColor: '#333',
            }
          }}
         />
    </>
  );

};

export default Tutorial;
