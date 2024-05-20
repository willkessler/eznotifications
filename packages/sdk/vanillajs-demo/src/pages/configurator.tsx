import React, { ChangeEvent, FormEvent, useState, useEffect, useRef, useCallback } from 'react';
import { Anchor, Button, Checkbox, Drawer, Group, Image, Modal, Paper, 
         RadioGroup, Radio, SegmentedControl, Select, Stack, Text, 
         TextInput, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHelp } from '@tabler/icons-react';
import { useSdkConfiguration } from '../lib/configuratorContext';
import { TargetInsertType, SDKConfiguration } from '../lib/types';
import classes from './css/configurator.module.css';

interface CheckForIntegerResult {
  value: number | null;
  success: boolean;
}

const Configurator = () => {
  const [ currentDisplayMode, setCurrentDisplayMode ] = useState<string>('toast');
  const [ customInlineDiv, setCustomInlineDiv ] = useState<boolean>(false);
  const [ inlineConfirmShown, setInlineConfirmShown  ] = useState<boolean>(true);
  const [ inlineDismissShown, setInlineDismissShown  ] = useState<boolean>(true);
  const [ inlineCustomStyleChoice, setInlineCustomStyleChoice ] = useState<string>("inline-custom-style:1");
  const [ bannerDismissShown, setBannerDismissShown  ] = useState<boolean>(true);
  const [ modalDismissShown, setModalDismissShown  ] = useState<boolean>(true);
  const [ helpModalOpen, setHelpModalOpen ] = useState<boolean>(false);
  const [ bannerDuration, setBannerDuration ] = useState<number | null>(5000);
  const [ customBannerStyles, setCustomBannerStyles  ] = useState<boolean>(false);
  const [opened, { open, close }] = useDisclosure(false);

  const { getSdkConfiguration, 
          setSdkConfiguration, 
          postMessageViaQueue,
          activeTab,
          setActiveTabDelayed } = useSdkConfiguration();
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialToastDuration = getSdkConfiguration().toast?.duration?.toString() || '';
  const [ toastDurationInputValue, setToastDurationInputValue] = useState<string>(initialToastDuration);

  const checkForInteger = (input: string): CheckForIntegerResult => {
    if (/^\d*$/.test(input)) {
      if (input.length < 1) {
        return { value: null, success: true};
      }
        
      const value = parseInt(input, 10);
      return { value, success: !isNaN(value) };
    }
    return { value: null, success: false };
  };
  
  const fixBlankEntry = (event:ChangeEvent<HTMLInputElement>, newValue:string) => {
    if (event.target.value.length == 0) {
      event.target.value = newValue;
    }
  }

  const getStoredApiKey = ():string | null => {
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
    if (configUpdate.toast) {
      configUpdate.toast.position = (valueStr ? valueStr : 'top-end');
    }
    setSdkConfiguration(configUpdate);
  }

  const setConfirmButtonLabel = (valueStr: string) => {
    const configUpdate = getSdkConfiguration();
    if (configUpdate.modal) {
      configUpdate.modal.confirmButtonLabel = (valueStr ? valueStr : 'OK');
    }
    setSdkConfiguration(configUpdate);
  }

  const formNoOp = (event:ChangeEvent<HTMLInputElement>) => {
    // since handling events at form level, this is just here to satisfy react's
    // insistence that every controlled input (with a value prop) has to have a handler
  };

  const updateSampleApp = useCallback((sdkConfig: SDKConfiguration) => {
    console.log('sdkConfig:', sdkConfig);
    const newConfigMessage = {
      name: 'tinadReconfigure',
      config: sdkConfig,
    };
    postMessageViaQueue(newConfigMessage);
  }, [postMessageViaQueue]);

  useEffect(() => {
    // first time we enter this demo, reset current user so you always see some notifs
    const configUpdate = getSdkConfiguration();
    console.log(`configurator useEffect, configUpdate: ${JSON.stringify(configUpdate,null,2)}`);
    configUpdate.api.displayMode = 'toast';
    if (!configUpdate.api.key) {
      const assignableKey = getStoredApiKey();
      configUpdate.api.key = (assignableKey !== null ? assignableKey : 'not set');
    }
    setSdkConfiguration(configUpdate);
    updateSampleApp(configUpdate);
  }, [getSdkConfiguration, setSdkConfiguration, postMessageViaQueue, updateSampleApp]);

  const formFieldDebounce = (executor:any) => {
    if (debounceTimeout.current != null) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(executor, 2500);
  }

  // Handler function for Select changes
  const handleSelectChange = (value:any) => {
    console.log('Select changed:', value);
    const [name, actualValue] = value.split(':');

    // Create a custom event
    const customEvent = {
      target: {
        name,
        type: 'select',
        value: actualValue,
        checked: false, // Select doesn't use checked, but we include it for completeness
      },
      type: 'change',
    };

    // Pass the custom event to handleSdkChange
    handleSdkChange(customEvent as unknown as React.FormEvent<HTMLFormElement>);
  };

  // Handler function for changes
  const handleSdkChange = (event:FormEvent<HTMLFormElement>) => {
    console.log('handleSdkChange, event:', event);
    const target = event.target as HTMLInputElement;
    if (target instanceof Object) {
      const { name, type, value, checked } = target;
      // Check if the input is a checkbox and use the checked value; otherwise use value
      const newValue = type === 'checkbox' ? (checked ? '1' : '0') : value;
      const { value: newDuration, success } = checkForInteger(newValue);

      console.log(`name: ${name}, newValue: ${newValue}`);
      const currentConfig = getSdkConfiguration();
      console.log('currentConfig, ', currentConfig);

      let mustDebounce = false;
      let mustUpdate = true;
      // Ensure banner and toast objects are initialized. I fu*** hate typescript today
      currentConfig.toast = currentConfig.toast ?? { position: '', duration: 0 };
      currentConfig.modal = currentConfig.modal ?? { confirmButtonLabel: '', show: { confirm: true, dismiss: true } };
      currentConfig.modal.show = currentConfig.modal.show ?? { confirm: true, dismiss: true };
      currentConfig.banner = currentConfig.banner ?? { duration: 5000, target: { useDefaults: true }, show: { dismiss: true } };
      currentConfig.banner.show = currentConfig.banner.show ?? { dismiss: true };
      currentConfig.inline = currentConfig.inline ?? { target: { useDefaults: true }, show: { confirm: true, dismiss: true } };
      currentConfig.inline.show = currentConfig.inline.show ?? { confirm: true, dismiss: true };

      console.log(`---> name=${name}`);
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
          mustUpdate = false;
          if (success) {
            setToastDurationInputValue(newValue);
            if (newDuration !== null) {
              currentConfig.toast.duration = newDuration;
              mustDebounce = true;
              mustUpdate = true;
            }
          }
          break;
        case 'banner-duration':
          mustUpdate = false;
          if (success) {
            setBannerDuration(newDuration);
            if (newDuration !== null) {
              currentConfig.banner.duration = newDuration;
              mustDebounce = true;
              mustUpdate = true;
            }
          }
          break;
        case 'modal-confirm-button-label':
          currentConfig.modal.confirmButtonLabel = newValue;
          mustDebounce = true;
          break;
        case 'show-modal-dismiss':
          currentConfig.modal.show.dismiss = (newValue == '1');
          setModalDismissShown(newValue === '1');
          break;
        case 'show-inline-confirm':
          currentConfig.inline.show.confirm = (newValue == '1');
          setInlineConfirmShown(newValue === '1');
          break;
        case 'show-inline-dismiss':
          currentConfig.inline.show.dismiss = (newValue == '1');
          setInlineDismissShown(newValue === '1');
          break;
        case 'show-banner-dismiss':
          currentConfig.banner.show.dismiss = (newValue === '1');
          setBannerDismissShown(newValue === '1');
          break;
        case 'custom-inline-div':
          if (checked) {
            currentConfig.inline.target = {
              outer: 'my-inline-container-1',
              content: 'my-content',
              confirm: 'my-confirm',
              dismiss: 'my-dismiss',
            };
            setCustomInlineDiv(true);
            setActiveTabDelayed('custom.css'); // need to use timeout so that ace editor updates the snippet tab before switching to the css tab
          } else {
            currentConfig.inline.target = { useDefaults: true };
            setCustomInlineDiv(false);
          }
          break;
        case 'inline-custom-style':
          setInlineCustomStyleChoice(`inline-custom-style:${newValue}`);
          currentConfig.inline.target = {
            outer: `my-inline-container-${newValue}`,
            content: 'my-content',
            confirm: 'my-confirm',
            dismiss: 'my-dismiss',            
          };
          setCustomInlineDiv(true);
          setActiveTabDelayed('custom.css'); // need to use timeout so that ace editor updates the snippet tab before switching to the css tab
          break;
        case 'custom-banner-styles':
          if (checked) {
            currentConfig.banner.target = {
              outer: `my-notification-banner`,
              slideDown: 'slideDown',
              slideUp: 'slideUp',
              content: 'content',
              dismiss: 'dismiss',            
            };
            setCustomBannerStyles(true);
            setActiveTabDelayed('custom.css'); // need to use timeout so that ace editor updates the snippet tab before switching to the css tab
          } else {
            currentConfig.banner.target = { useDefaults: true };
            setCustomBannerStyles(false);
          }
          break;
      }

      if (mustUpdate) {
        //console.log(`currentConfig: ${JSON.stringify(currentConfig,null,2)}`);
        setSdkConfiguration(currentConfig);
        const doUpdates = () => {
          updateSampleApp(currentConfig);
        }
        if (mustDebounce) {
          formFieldDebounce(doUpdates);
        } else {
          doUpdates();
        }
      }
    }
  };

  return (
    <>
      <Drawer opened={opened} onClose={close} size="xl">
        <iframe src={process.env.NEXT_PUBLIC_TINAD_DASHBOARD_URL} />
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
            <Paper className="p-6 m-6 max-w-lg">
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
              <TextInput className="pt-6 max-w-xs"
                name="toast-duration"
                value={toastDurationInputValue}
                onChange={formNoOp}
                onBlur={(event) => { fixBlankEntry(event as ChangeEvent<HTMLInputElement>, '5000') }}
                label="Toast duration"
                description="How long before a toast is auto-dismissed (milliseconds)."
                placeholder="5000"
              />
            </Paper>
          }
          { (currentDisplayMode === 'modal') &&
            <Paper className="p-6 m-6 max-w-lg">
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
            <Paper className="p-6 m-6 max-w-lg">
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
                label="Customize styles"
                description="Check this box to see custom styles applied to inline notifications. (Modify the custom.css file in the editor to the right to see how this works)."
                name="custom-inline-div"
                checked={customInlineDiv}
                onChange={formNoOp}
            />
            <Select
              className="pt-2 pl-8"
              label="Try a custom styles banner!"
              value={inlineCustomStyleChoice}
              onChange={handleSelectChange}
              data={[
                { value: 'inline-custom-style:1', label: 'Example 1: content in center of page' },
                { value: 'inline-custom-style:2', label: 'Example 2: content in header' },
                { value: 'inline-custom-style:3', label: 'Example 3: content in footer ' },
              ]}
            />
            </Paper>
          }
          { (currentDisplayMode === 'banner') &&
            <Paper className="p-6 m-6 max-w-lg">
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
                value={bannerDuration !== null ? bannerDuration : ''}
                onChange={formNoOp}
                onBlur={(event) => { fixBlankEntry(event as ChangeEvent<HTMLInputElement>, '5000') }}
                label="Banner duration"
                description="How long before a banner is auto-dismissed (milliseconds)."
                placeholder="5000"
              />
            </Paper>
          }
        </form>
        <Modal
          opened={helpModalOpen}
          onClose={() => setHelpModalOpen(false)}
          size="70%"
        >
          <Paper className="p-8">
            <Stack>
              <Group>
                <Anchor href="https://this-is-not-a-drill.com" target="_blank" >
                  <Image src="/ThisIsNotADrill_cutout.png" w={50} alt="This Is Not A Drill! Logo" className="w-12 h-auto" />
                </Anchor>              
                <Title order={3}>Using the TINAD Demo Configurator</Title>
              </Group>
              <Text>
                Watch the 1 minute below to learn how this demo works.
              </Text>
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe 
                  src="https://www.loom.com/embed/4922508649134ecd92665bbd28ff5a6f?sid=5eb729bd-cf4e-4b7c-9f4b-5e86e45c6bb1" 
                  frameBorder="0" 
                  allowFullScreen 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                ></iframe>
              </div>
            </Stack>
          </Paper>
        </Modal>
        <Button size="xs" className="dashboard-drawer-button" onClick={open}>&gt;&gt;&nbsp;Manage Notifications</Button>
        <Tooltip label="Click to get help" withArrow>
          <Button size="xs" className="help-button" onClick={() => { setHelpModalOpen(true) }}>
            <IconHelp size={20} style={{color:'#fff'}} />&nbsp;Help
          </Button>
        </Tooltip>
      </div>
    </>
  );
}

export default Configurator;
