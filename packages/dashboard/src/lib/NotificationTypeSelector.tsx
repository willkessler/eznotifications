import React, { useState, useEffect } from 'react';
import { RadioGroup, Radio, TextInput } from '@mantine/core';
import classes from '../components/Notifications/Notifications.module.css';
import { IconInfoCircle, IconAlertTriangle, IconExchange,
         IconCloudStorm, IconExclamationCircle, IconDots,
         IconSpeakerphone} from '@tabler/icons-react';
import type { TablerIconsProps } from '@tabler/icons-react';
import { NotificationType } from './shared_dts/NotificationsContext.d';

interface NotificationTypeSelectorProps {
    value: string;
    notificationTypeOther: string | null;
    onSelectionChange: (selectType: string) => void;
    onCustomTypeChange: (customType: string) => void;
}

export const NotificationTypeSelector: React.FC<NotificationTypeSelectorProps> = ( { 
    value,
    notificationTypeOther,
    onSelectionChange, 
    onCustomTypeChange,
}) => {
    const [selectedType, setSelectedType] = useState(value || 'info');
    const [customType, setCustomType] = useState('');

    const handleTypeChange = (valueStr: string) => {
        const value = valueStr as NotificationType;
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

    const handleCustomTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newCustomType = event.currentTarget.value;
        setCustomType(newCustomType);
        if (selectedType === 'other') {
            onCustomTypeChange(newCustomType); // Only call onCustomTypeChange if 'other' is selected
        }
    };

    type IconType = React.FC<TablerIconsProps>;

    const CustomLabel: React.FC<{ Icon: IconType; text: string; bgColor: string }> = ({
        Icon,
        text,
        bgColor
    }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icon style={{ marginLeft:'0px', marginRight: '5px', paddingBottom:'2px', color:bgColor }} />
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
            <Radio value="info" label={<CustomLabel Icon={IconInfoCircle} text="Info" bgColor="#2f2" />} />
            <Radio value="change" label={<CustomLabel Icon={IconExchange} text="Change" bgColor="aaf" />} />
            <Radio value="alert" label={<CustomLabel Icon={IconAlertTriangle} text="Alert" bgColor="#orange" />} />
            <Radio value="outage" label={<CustomLabel Icon={IconCloudStorm} text="Outage" bgColor="#f22" />} />
            <Radio value="call_to_action" label={<CustomLabel Icon={IconSpeakerphone} text="Call to action" bgColor="#ff2" />} />
            <Radio value="other" label={<CustomLabel Icon={IconDots} text="Other" bgColor="#666" />} />
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
