import React, { useEffect, useState } from 'react';
import Joyride from 'react-joyride';
import { Anchor, Button, Image, Modal, Space } from '@mantine/core';
import mainClasses from './css/MainLayout.module.css';
import navClasses from './css/Navbar.module.css';

const Tutorial = () => {

  const [ runState, setRunState ] = useState(false);
  const [ isTutorialModalOpen, setIsTutorialModeOpen ] = useState(true);
  
  const takeTheTour = () => {
    setIsTutorialModeOpen(false);
    setRunState(true);
  };
  
  const closeTutorialModal = () => {
    setIsTutorialModeOpen(false);
  };

  const steps = [
      {
        target: '[data-tour="notifications"]',
        content: 'Use the notifications page to create and configure notifications to show your users.', 
        disableBeacon: true,
        placement: 'right-end',
        locale: { skip: <strong aria-label="skip">Skip</strong> },
      },
      {
        target: '[data-tour="sandbox"]',
        content: 'After setting up a notification or two, you can always try it out in the sandbox.', 
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
                <Image src="/ThisIsNotADrill_cutout.png" h={120} />Welcome!
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div style={{marginBottom:'10px'}}>
                <span style={{fontStyle:'italic',fontWeight:'bold'}}>This Is Not A Drill! </span>
                makes it easy to set up immediate, critical,
                or scheduled notices to users, <span style={{fontWeight:'bold'}}>without deploying code</span>.
                <br /><br />
                Why not take the (literally) 30-second tour?
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems:'center', marginTop:'30px' }}>
                <Anchor onClick={() => { closeTutorialModal() }} style={{ color:'#ccc', fontStyle:'italic', marginRight:'10px', color:'#999'}}>No thanks, I got this!</Anchor>
                <Button onClick={() => { takeTheTour() }}>Take the 30-second tour!</Button>
              </div>
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>

        <Joyride 
          continuous
          hideCloseButton
          run={runState}
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
