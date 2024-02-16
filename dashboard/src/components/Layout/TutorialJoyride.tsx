import Joyride from 'react-joyride';
import mainClasses from './css/MainLayout.module.css';
import navClasses from './css/Navbar.module.css';

const TutorialJoyride = () => {

  const joyrideState = {
    run: false,
    showProgress: true,
    steps: [
      {
        target: '[data-tour="notifications"]',
        content: 'Start here to review and create user notifications', 
        disableBeacon: true,
        placement: 'right-end',
        locale: { skip: <strong aria-label="skip">Skip</strong> },
      },
      {
        target: '[data-tour="sandbox"]',
        content: 'After setting up a notification or two, try it out in the sandbox.', 
        disableBeacon: true,
        placement: 'right-end',
      },
    ]
  };

  const { steps } = joyrideState;

  return (
      <>
        <Joyride 
          continuous
          hideCloseButton
          run={true}
          scrollToFirstStep
          showProgress
          showSkipButton
          steps={steps}
          styles={{
            options: {
              zIndex: 10000,
            },
          }}
         />
    </>
  );

};

export default TutorialJoyride;
