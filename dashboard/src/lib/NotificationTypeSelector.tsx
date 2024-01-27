import React, { useState, useEffect } from 'react';
import { RadioGroup, Radio, TextInput } from '@mantine/core';
import classes from '../components/Notifications/Notifications.module.css';

export function NotificationTypeSelector({ value, onSelectionChange }) {
  const [selectedType, setSelectedType] = useState(value || 'info');
  const [customType, setCustomType] = useState('');

  const handleTypeChange = (value) => {
    setSelectedType(value);
    if (value === 'other') {
      onSelectionChange(customType);
    } else {
      setCustomType('');
      onSelectionChange(value);
    }
  };

  const handleCustomTypeChange = (event) => {
    setCustomType(event.currentTarget.value);
    onSelectionChange(event.currentTarget.value);
  };

  useEffect(() => {
    setSelectedType(value || 'info');
  }, [value]);

  return (
    <div>
      <RadioGroup 
        style={{width:'300px'}}
        value={selectedType} 
        onChange={handleTypeChange}
        label="Notification type (optional)"
        description="Set the type for this notification, so you can decorate it appropriately in your app."
        className={classes.notificationTypeChoice}
      >
        <Radio value="info" label="Info" />
        <Radio value="change" label="Change" />
        <Radio value="alert" label="Alert" />
        <Radio value="outage" label="Outage" />
        <Radio value="call_to_action" label="Call to Action" />
        <Radio value="other" label="Other" />
      </RadioGroup>

      {selectedType === 'other' && (
        <TextInput
          label="Specify Other Type"
          placeholder="Type here"
          value={customType}
          onChange={handleCustomTypeChange}
        />
      )}
    </div>
  );
};
