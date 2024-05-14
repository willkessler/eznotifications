import { useState, useEffect } from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function Configurator() {
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
    <div className="flex flex-col">
      <header className="bg-gray-900 text-white p-4 md:p-6">
        <div className="mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">TINAD Configurator</h1>
          <div className="hidden md:block">
          </div>
        </div>
      </header>
      <form onChange={(event) => { handleSdkChange(event) }}>
        <div className="flex-1 max-h-screen bg-gray-100 p-6 md:p-8 md:flex">
          <Select name="display-mode">
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Notification display type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="toast">Toast</SelectItem>
                <SelectItem value="modal">Modal</SelectItem>
                <SelectItem value="inline">Inline</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          {(sdkConfig.displayMode === 'toast' &&
            <div className="flex-1 bg-gray-100 p-6 sm:p-2 md:flex">
              <Select name="toast-position">
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Toast position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {(sdkConfig.displayMode === 'modal' &&
            <div className="sm:m-12 bg-gray-100">
              <Label htmlFor="confirm-button-label">Confirm Button Label</Label>
              <Input 
                onChange={()=>{}}
                id="confirm-button-label" 
                name="confirm-button-label" 
                type="text" 
                value={sdkConfig.modal.confirmButtonLabel} 
                placeholder="OK" 
              />
            </div>
          )}

          {(sdkConfig.displayMode === 'inline' &&
            <h4>Inline</h4>
          )}

          {(sdkConfig.displayMode === 'banner' &&
            <h4>Banner</h4>
          )}
          
        </div>
      </form>
    </div>
  )
};
