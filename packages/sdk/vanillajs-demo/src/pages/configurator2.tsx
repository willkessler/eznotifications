import { useState, useEffect } from 'react';
import { SegmentedControl } from '@mantine/core';
import classes from './css/GradientSegmentedControl.module.css';
import { useSdkConfiguration } from './configuratorContext';
import { TargetInsertType, SDKConfiguration } from '../../../vanillajs/src/types';

const Configurator2 = () => {
  const { getSdkConfiguration, setSdkConfiguration } = useSdkConfiguration();

  const updateSampleApp = (sdkConfig: SDKConfiguration) => {
    console.log('sdkConfig:', sdkConfig);
    const bankIframe = document.getElementById('bank-app') as HTMLIFrameElement;
    if (bankIframe && bankIframe.contentWindow) {
      const newConfigMessage = {
        name: 'tinadReconfigure',
        config: sdkConfig,
      };
      const messageString = JSON.stringify(newConfigMessage);
      bankIframe.contentWindow.postMessage(messageString, window.location.origin);
    }
  }

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
        const configUpdate = getSdkConfiguration();
        configUpdate.api.displayMode = newValue.toLowerCase();
        setSdkConfiguration(configUpdate);
        updateSampleApp(configUpdate);
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
