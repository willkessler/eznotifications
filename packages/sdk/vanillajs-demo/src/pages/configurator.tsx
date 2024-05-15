import { useState, useEffect, useRef } from 'react';
import { Button, Checkbox, Drawer, Group, Paper,Radio, SegmentedControl, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSdkConfiguration } from './configuratorContext';
import { TargetInsertType, SDKConfiguration } from '../../../vanillajs/src/types';
import classes from './css/configurator.module.css';

const Configurator = () => {
  const [ currentDisplayMode, setCurrentDisplayMode ] = useState<string>('toast');
  const [ customInlineDiv, setCustomInlineDiv ] = useState<boolean>(false);
  const [ inlineConfirmShown, setInlineConfirmShown  ] = useState<boolean>(true);
  const [ inlineDismissShown, setInlineDismissShown  ] = useState<boolean>(true);
  const [ bannerDismissShown, setBannerDismissShown  ] = useState<boolean>(true);
  const [ modalDismissShown, setModalDismissShown  ] = useState<boolean>(true);
  const [ customBannerStyles, setCustomBannerStyles  ] = useState<boolean>(false);
  const [opened, { open, close }] = useDisclosure(false);

  const { getSdkConfiguration, 
          setSdkConfiguration, 
          activeTab, 
          setActiveTab } = useSdkConfiguration();
  const debounceTimeout = useRef<number | null>(null);

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
    setSdkConfiguration(configUpdate);
    updateSampleApp(configUpdate);
  }, []);

  const formFieldDebounce = (executor:any) => {
    if (debounceTimeout.current != null) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(executor, 2500);
  }

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

    let mustDebounce = false;
    let newDuration;
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
        newDuration = parseInt(newValue);
        if (newValue.length < 1) {
          newDuration = 0;
        }
        currentConfig.toast.duration = newDuration;
        mustDebounce = true;
        break;
      case 'banner-duration':
        newDuration = parseInt(newValue);
        if (newValue.length < 1) {
          newDuration = 0;
        }
        currentConfig.banner.duration = newDuration;
        mustDebounce = true;
        break;
      case 'inline-placement':
        currentConfig.inline.placement = newValue;
        break;
      case 'modal-confirm-button-label':
        currentConfig.modal.confirmButtonLabel = newValue;
        mustDebounce = true;
        break;
      case 'show-modal-dismiss':
        currentConfig.modal.show.dismiss = newValue;
        setModalDismissShown(newValue);
        break;
      case 'show-inline-confirm':
        currentConfig.inline.show.confirm = newValue;
        setInlineConfirmShown(newValue);
        break;
      case 'show-inline-dismiss':
        currentConfig.inline.show.dismiss = newValue;
        setInlineDismissShown(newValue);
        break;
      case 'show-banner-dismiss':
        currentConfig.banner.show.dismiss = newValue;
        setBannerDismissShown(newValue);
        break;
      case 'custom-inline-div':
        if (checked) {
          currentConfig.inline.target = {
            outer: 'my-inline-container',
            content: 'my-content',
            confirm: 'my-confirm',
            dismiss: 'my-dismiss',
          };
          setCustomInlineDiv(true);
          setActiveTab('custom.css');
        } else {
          currentConfig.inline.target = 'default';
          setCustomInlineDiv(false);
        }
        break;
      case 'custom-banner-styles':
        if (checked) {
          currentConfig.banner.target = {
            outer: 'my-notification-banner',
            slideDown: 'slideDown',
            slideUp: 'slideUp',
            content: 'content',
            dismiss: 'dismiss',            
          };
          setCustomBannerStyles(true);
          setActiveTab('custom.css');
        } else {
          currentConfig.banner.target = 'default';
          setCustomBannerStyles(false);
        }
        break;
    }

    console.log(`currentConfig: ${JSON.stringify(currentConfig,null,2)}`);
    setSdkConfiguration(currentConfig);
    const doUpdates = () => {
      updateSampleApp(currentConfig);
    }
    if (mustDebounce) {
      formFieldDebounce(doUpdates);
    } else {
      doUpdates();
    }
  };

  return (
    <>
      <Drawer opened={opened} onClose={close} title="Add or edit notifications below:" size="lg">
        <iframe src="https://demo-dashboard.this-is-not-a-drill.com" />
      </Drawer>

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
              <TextInput className="pt-6"
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
              <Checkbox
                className="pt-6"
                label="Show dismiss control"
                description="Uncheck this to remove the 'x' dismiss control on modal notifications."
                name="show-modal-dismiss"
                checked={modalDismissShown}
                onChange={formNoOp}
              />
            </Paper>
          }
          { (currentDisplayMode === 'inline') &&
            <Paper className="p-6 m-6">
              <Checkbox
                label="Show confirm button"
                description="Uncheck this to remove the Confirm button inline notifications."
                name="show-inline-confirm"
                checked={inlineConfirmShown}
                onChange={formNoOp}
              />
              <Checkbox
                className="pt-6"
                label="Show dismiss control"
                description="Uncheck this to remove the 'x' dismiss control on inline notifications."
                name="show-inline-dismiss"
                checked={inlineDismissShown}
                onChange={formNoOp}
              />
              <Checkbox
                className="pt-6"
                label="Custom styling"
                description="Check this box to see custom styles applied to inline notifications. (Modify the custom.css file in the editor to the right to see how this works)."
                name="custom-inline-div"
                checked={customInlineDiv}
                onChange={formNoOp}
              />
            </Paper>
          }
          { (currentDisplayMode === 'banner') &&
            <Paper className="p-6 m-6">
              <Checkbox
                label="Show dismiss control"
                description="Uncheck this to remove the 'x' dismiss control on inline notifications."
                name="show-banner-dismiss"
                checked={bannerDismissShown}
                onChange={formNoOp}
              />
              <Checkbox
                className="pt-6"
                label="Custom styling"
                description="Check this box to see custom styles applied to banners. (Modify the custom.css file in the editor to the right to see how this works)."
                name="custom-banner-styles"
                checked={customBannerStyles}
                onChange={formNoOp}
              />
              <TextInput className="pt-6"
                name="banner-duration"
                value={getSdkConfiguration().banner?.duration}
                onChange={formNoOp}
                label="Banner duration"
                description="How long before a banner is auto-dismissed (milliseconds)."
                placeholder="5000"
              />
            </Paper>
          }
        </form>
        <Button size="xs" className="dashboard-drawer-button" onClick={open}>Manage Notifications ></Button>
      </div>
    </>
  );
}

export default Configurator;
