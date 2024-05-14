import { useState, useEffect } from 'react';
import { Group, Paper,Radio, SegmentedControl, TextInput } from '@mantine/core';
import classes from './css/GradientSegmentedControl.module.css';
import { useSdkConfiguration } from './configuratorContext';
import { TargetInsertType, SDKConfiguration } from '../../../vanillajs/src/types';

const Configurator = () => {
  const [ currentDisplayMode, setCurrentDisplayMode ] = useState<string>('toast');
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

  const getStoredApiKey = ():string => {
    const tinadConfigStr = localStorage.getItem('tinad');
    if (tinadConfigStr) {
      const tinadConfig = JSON.parse(tinadConfigStr);
      if (tinadConfig.apiKey) {
        return tinadConfig.apiKey;
      }
    }    
    return null;
  }

  const setToastPosition = (valueStr: string) => {
    const configUpdate = getSdkConfiguration();
    configUpdate.toast.position = valueStr;
    setSdkConfiguration(configUpdate);
  }
  
  const setConfirmButtonLabel = (valueStr: string) => {
    const configUpdate = getSdkConfiguration();
    configUpdate.modal.confirmButtonLabel = valueStr;
    setSdkConfiguration(configUpdate);
  }
  
  const formNoOp = (event:EventSource) => {
    // since handling events at form level, this is just here to satisfy react's
    // insistence that every controlled input (with a value prop) has to have a handler
  }
  

  useEffect(() => {
    // first time we enter this demo, reset current user so you always see some notifs
    const configUpdate = getSdkConfiguration();
    configUpdate.api.displayMode = 'toast'
    if (!configUpdate.api.key) {
      configUpdate.api.key = getStoredApiKey();
    }
    updateSampleApp(configUpdate);
  }, []);
  

  // Handler function for changes
  const handleSdkChange = (event) => {
    console.log("event:", event);
    const { name, type, value, checked } = event.target;
    // Check if the input is a checkbox and use the checked value; otherwise use value
    const newValue = type === 'checkbox' ? checked : value;
    console.log(`name: ${name}, newValue: ${newValue}`);
    const currentConfig = getSdkConfiguration();
    console.log('currentConfig, ', currentConfig);
    let newData = {
      api: {
        userId: currentConfig.api.userId,
        endpoint: currentConfig.api.endpoint,
        key: currentConfig.api.key,
        environments: currentConfig.environments,
        domains: currentConfig.domains,
      }
    };

    switch (name) {
      case 'display-mode':
        const newMode = newValue.toLowerCase();
        currentConfig.api.displayMode = newMode;
        setCurrentDisplayMode(newMode);
        break;
      case 'toast-position':
        currentConfig.toast.position = newValue;
        break;
      case 'toast-duration':
        currentConfig.toast.duration = newValue;
        break;
      case 'inline-placement':
        currentConfig.inline.placement = newValue;
        break;
      case 'modal-confirm-button-label':
        console.log(`setting confirm button label to ${newValue}`);
        currentConfig.modal.confirmButtonLabel = newValue;
        break;
    }

    console.log(`currentConfig: ${JSON.stringify(currentConfig,null,2)}`);
    setSdkConfiguration(currentConfig);
    updateSampleApp(currentConfig);
  };

  return (
    <div style={{backgroundColor:'#000', height:'100%'}}>
      <form onChange={(event) => { handleSdkChange(event) }}>
        <SegmentedControl
          name="display-mode"
          radius="xl"
          size="md"
          data={['Toast', 'Modal', 'Inline', 'Banner']}
          style={{ width:'90%' }}
          classNames={classes}
        />
        { (currentDisplayMode === 'toast') &&
          <Paper className="p-6 m-6">
            <Radio.Group
              name="toast-position"
              label="Select a toast position"
              value={getSdkConfiguration().toast?.position}
              onChange={setToastPosition}
              description="This is where your toast will show on the browser screen."
            >
              <Group mt="sm">
                <Radio value="top-start" label="Upper left" />
                <Radio value="top-end" label="Upper right" />
              </Group>
              <Group mt="sm">
                <Radio value="bottom-start" label="Lower left" />
                <Radio value="bottom-end" label="Lower right" />
              </Group>
            </Radio.Group>
            <TextInput className="pt-12"
              name="toast-duration"
              value={getSdkConfiguration().toast?.duration}
              onChange={formNoOp}
              label="Toast duration"
              description="How long before a toast is auto-dismissed (milliseconds)."
              placeholder="5000"
            />
          </Paper>
        }
      { (currentDisplayMode === 'modal') &&
        <Paper className="p-6 m-6">
          <TextInput
            name="modal-confirm-button-label"
            value={getSdkConfiguration().modal?.confirmButtonLabel}
            onChange={formNoOp}
            label="Confirm Button Label"
            description="What you want the modal confirm button to say."
            placeholder="OK"
          />
        </Paper>
      }
      </form>
    </div>
  );
}

export default Configurator;
