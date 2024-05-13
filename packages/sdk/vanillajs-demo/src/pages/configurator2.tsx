import { useState, useEffect } from 'react';
import { SegmentedControl } from '@mantine/core';
import classes from './css/GradientSegmentedControl.module.css';

const Configurator2 = () => {
  const [ sdkConfig, setSdkConfig ] = useState<Object>({
    displayMode: 'toast',
    toast: {
      position: 'top-left',
    },
    inline: {
      placement: 'target-inside',
    },
    modal: {
      confirmButtonLabel: 'OK',
    },
  });

  useEffect(() => {
    console.log('sdkConfig:', sdkConfig);
    const bankIframe = document.getElementById('bank-app') as HTMLIFrameElement;
    if (bankIframe && bankIframe.contentWindow) {
      const newConfig = `RELOAD_SDK:${JSON.stringify(sdkConfig)}`;
      bankIframe.contentWindow.postMessage(newConfig, window.location.origin);
    }

  }, [sdkConfig]);

  // Handler function for changes
  const handleSdkChange = (event) => {
    console.log("event:", event);
    const { name, type, value, checked } = event.target;
    // Check if the input is a checkbox and use the checked value; otherwise use value
    const newValue = type === 'checkbox' ? checked : value;
    console.log(`name: ${name}, newValue: ${newValue}`);
    let newData = {};
    switch (name) {
      case 'display-mode':
        newData = { displayMode: newValue };
        break;
      case 'toast-position':
        newData = { toast: { position: newValue } };
        break;
      case 'inline-placement':
        newData = { inline: { placement: newValue } };
        break;
      case 'confirm-button-label':
        console.log(`setting confirm button label to ${newValue}`);
        newData = { modal: { confirmButtonLabel: newValue } };
        break;
    }
    setSdkConfig(prevData => ({
      ...prevData,
      ...newData,
    }));
  };

  return (
    <div  style={{backgroundColor:'#000', height:'100%'}}>
      <form onChange={(event) => { handleSdkChange(event) }}>
        <SegmentedControl
          name="display-mode"
          radius="xl"
          size="md"
          data={['Toast', 'Modal', 'Inline', 'Banner']}
          style={{ width:'90%' }}
          classNames={classes}
        />
      </form>
    </div>
  );
}

export default Configurator2;
