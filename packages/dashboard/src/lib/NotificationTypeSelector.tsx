import React, { useState, useEffect } from 'react';
import { RadioGroup, Radio, TextInput } from '@mantine/core';
import classes from '../components/Notifications/Notifications.module.css';
import {  IconInfoCircle, IconAlertTriangle, IconExchange,
          IconCloudStorm, IconExclamationCircle, IconDots,
          IconSpeakerphone} from '@tabler/icons-react';

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

  const customLabel = (icon, text, bgColor) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {React.createElement(icon, { style: { marginLeft:'0px', marginRight: '5px', paddingBottom:'2px', color:bgColor } })}
      {text}
    </div>
  );

  useEffect(() => {
    setSelectedType(value || 'info');
    setCustomType(notificationTypeOther || '');
  }, [value, notificationTypeOther]);

  return (
    <div>
      <RadioGroup 
        value={selectedType} 
        onChange={handleTypeChange}
        label="Notification type"
        description="(Optional)"
        className={classes.notificationTypeChoice}
      >
        <Radio value="info" label={customLabel(IconInfoCircle,"Info", "#2f2")} />
        <Radio value="change" label={customLabel(IconExchange, "Breaking change", "#aaf")} />
        <Radio value="alert" label={customLabel(IconAlertTriangle, "Alert", "orange")} />
        <Radio value="outage" label={customLabel(IconCloudStorm, "Outage", "#f22")} />
        <Radio value="call_to_action" label={customLabel(IconSpeakerphone, "Call to Action", "#ff2")} />
        <Radio value="other" label={customLabel(IconDots, "Other", "#666")} />
      </RadioGroup>

      {selectedType === 'other' && (
        <TextInput
          label="Specify other type:"
          placeholder="Type here"
          value={customType}
          onChange={handleCustomTypeChange}
        />
      )}
    </div>
  );
};
