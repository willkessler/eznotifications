import React, { useState, useEffect } from 'react';
import { RadioGroup, Radio, TextInput } from '@mantine/core';
import classes from '../components/Notifications/Notifications.module.css';

export function NotificationTypeSelector({ value, notificationTypeOther, onSelectionChange, onCustomTypeChange }) {
  const [selectedType, setSelectedType] = useState(value || 'info');
  const [customType, setCustomType] = useState('');

  const handleTypeChange = (value) => {
    setSelectedType(value);
    onSelectionChange(value); // Always call onSelectionChange with the current radio selection

    if (value === 'other') {
      // If 'other' is selected, also call onCustomTypeChange with the current custom type
      onCustomTypeChange(customType);
    } else {
      // Reset customType if 'other' is not selected
      setCustomType('');
    }
  };

  const handleCustomTypeChange = (event) => {
    const newCustomType = event.currentTarget.value;
    setCustomType(newCustomType);
    if (selectedType === 'other') {
      onCustomTypeChange(newCustomType); // Only call onCustomTypeChange if 'other' is selected
    }
  };

  useEffect(() => {
    setSelectedType(value || 'info');
    setCustomType(notificationTypeOther || '');
  }, [value, notificationTypeOther]);

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
