import React, { useState, useRef, useEffect } from 'react';
import { Anchor, Button, Checkbox, Group, Modal, MultiSelect, Paper, Textarea, Text, TextInput, Title } from '@mantine/core';
import { DateTimePicker, DatePickerInput, TimeInput, DateValue } from '@mantine/dates';
import { ActionIcon, rem } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useUser } from "@clerk/clerk-react";

import type EZNotification from '../../lib/shared_dts/EZNotification';
import { NotificationType } from '../../lib/shared_dts/NotificationsContext.d';
import { createBlankEZNotification } from '../../lib//EZNotificationUtilities';
import UserHint from '../../lib/UserHint';
import Expando from '../../lib/Expando';
import TimezonePicker from '../../lib/TimezonePicker';
import { NotificationTypeSelector } from '../../lib/NotificationTypeSelector';
import { useNotifications } from './NotificationsContext';
import { useTimezone } from '../../lib/TimezoneContext';
import { useDateFormatters } from '../../lib/DateFormattersProvider';

interface CustomLabelWithHintProps {
    text: string;
    hintText: string;
};

const NotificationsModal = () => {
    const { isModalOpen, 
            modalInitialData, 
            closeModal, 
            submitNotification,
            formatCreateInfo,
          } = useNotifications();
    const { formatDisplayTime,
            formatDisplayDate,
          } = useDateFormatters();

    const editing = (modalInitialData != null);
    const { user } = useUser();
    const { userTimezone, setUserTimezone } = useTimezone();

    //console.log('modalInitialData:', modalInitialData, ' editing:', editing);

    const [timeInputsDisabled, setTimeInputsDisabled] = useState(true);
    const [notificationType, setNotificationType] = useState('info'); // default is the "info" choice
    const [dateValue, setDateValue] = useState<Date | null>(null);
    const [submissionDisabled, setSubmissionDisabled] = useState(true); 

    const [notificationData, setNotificationData] = useState<EZNotification>();
    const [mustBeDismissed, setMustBeDismissed] = useState<boolean>(false);

    const handleNotificationTypeChange = (type: string) => {
        //console.log('handleNotificationTypeChange:', type);
        setNotificationData(prevData => ({
            ...prevData as EZNotification,
            notificationType: type,
        }));
    };

    const handleCustomNotificationTypeChange = (customType: string) => {
        //console.log('handleCustomNotificationTypeChange:', customType, 'notificationData.notificationType=', notificationData.notificationType);
        setNotificationData(prevData => ({
            ...prevData as EZNotification,
            notificationTypeOther: customType
        }));

    };

    const handleModalClose = () => {
        const resetNotification:EZNotification = createBlankEZNotification();
        setNotificationData(resetNotification);
        closeModal();
    }

    const handleEnvironmentsChange = (values: string[]) => {
        //console.log('environments change:', values);
        setNotificationData(prevData => ({
            ...prevData as EZNotification,
            environments: values
        }));
    };

    const handleTextChange = (e:React.ChangeEvent<HTMLTextAreaElement>|React.ChangeEvent<HTMLInputElement>) => {
        const currentText = e.target.value;
        const currentTextTrimmed = currentText.trim();
        setNotificationData({ ...notificationData as EZNotification, [e.target.name]: currentText });
        setSubmissionDisabled(currentTextTrimmed.length == 0);
    };

    const handleDateTimeClick = (value: DateValue, name:string) => {
        setNotificationData(prevData => ({
            ...prevData as EZNotification,
            startDate: new Date(),
        }));
    };

    const handleDateTimeChange = (value: DateValue, name:string) => {
        if (notificationData === undefined) {
            console.error('Cannot handleDateTimeChange because notificationData is not set.');
        } else {
            if ((name === 'startDate') && (value === null)) {
                // instantly clear both dates, if user clears the startDate
                setNotificationData(prevData => ({
                    ...prevData as EZNotification,
                    startDate: null,
                    endDate: null,
                }));
            } else if ((name === 'startDate') && 
                (value &&
                    notificationData.endDate && 
                    value >= notificationData.endDate)) {
                setNotificationData(prevData => ({
                    ...prevData as EZNotification,
                    startDate: value,
                    endDate: null,
                }));
            } else if ((name === 'endDate') &&
                (value && notificationData.startDate &&
                    value <= notificationData.startDate)) {
                setNotificationData(prevData => ({
                    ...prevData as EZNotification,
                    startDate: null,
                    endDate: value,
                }));
            } else {
                setNotificationData({ ...notificationData as EZNotification, [name]: value });
            }
        }
    };

    const handleMustBeDismissed = (event:React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        // Save to localStorage
        localStorage.setItem('mustBeDismissed', isChecked.toString());
        setMustBeDismissed(isChecked);
        setNotificationData({ ...notificationData as EZNotification, 'mustBeDismissed': isChecked });
    };

    const handleSubmit = (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Make a copy of notificationData so we can massage it for submission to the API.
        const formData = {
            ...notificationData,
        };

        // make sure, if user did not pick 'other', that we null out the custom field value (so user perceives it resetting)
        if (formData.notificationType !== 'other') {
            //console.log('clearing notificationTypeOther');
            formData.notificationTypeOther = null;
        }

        // Destructure the dateRange to get startDate and endDate
        /*
          const [startDate, endDate] = formData.dateRange;

          if (startDate && endDate) {
          // Check if startTime and endTime are provided; if not, set them to midnight
          formData.startTime = formData.startTime || '00:00';
          formData.endTime = formData.endTime || '00:00';

          // Parse the time strings into hours and minutes
          const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
          const [endHours, endMinutes] = formData.endTime.split(':').map(Number);

          // Create new Date objects to avoid mutating the original date objects
          formData.startDate = new Date(startDate);
          formData.endDate = new Date(endDate);

          // Set the time portion of the date objects to the parsed hours and minutes
          formData.startDate.setHours(startHours, startMinutes);
          formData.endDate.setHours(endHours, endMinutes);
          }
        */

        if (editing) {
            formData.updatedAt = new Date();
        } else {
            formData.updatedAt = null;
        }

        console.log('Form data for submission=:', formData);

        // Use formData for submission or further processing.
        // Pass in the clerk id so the backend can tie the notif to the right organization
        if (user) {
            formData.clerkCreatorId = user.id;
            submitNotification(formData);
            // clear stored notification data for the next one to be submitted
            const blankEZNotification = createBlankEZNotification();
            setNotificationData(blankEZNotification);
        } else {
            console.error('Clerk user not found, cannot submit.');
        }
        // Other necessary actions like closing the modal
        closeModal();
    };

    const CustomLabelWithHint:React.FC<CustomLabelWithHintProps> = ({ text, hintText }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{text}</span>
            <UserHint hintText={hintText}>
            <span />
            </UserHint>
            </div>
    );

    const handleFocus = () => {
        if (!dateValue) { // Only set the date if it's not already set
            const todayAtMidnight = new Date();
            todayAtMidnight.setHours(0, 0, 0, 0);
            setDateValue(todayAtMidnight);
        }
    }
    

    useEffect(() => {
        if (editing) {
            //console.log('useEffect. initialState=', modalInitialData);
            const formattedStartDate = (modalInitialData.startDate == null ? null : new Date(modalInitialData.startDate));
            const formattedEndDate   = (modalInitialData.endDate == null ? null : new Date(modalInitialData.endDate));
            const initialEnvironmentsArray = modalInitialData.environments;
            //console.log('initialEnvironmentsArray:', initialEnvironmentsArray);

            //console.log('pre-iso', formattedStartDate, formattedStartTime);

            //console.log('pre setnotif, notificationData:', notificationData);
            setNotificationData({
                ...modalInitialData, // Spread the modalInitialData passed in for editing
                editing: true,
                startDate: formattedStartDate,
                endDate:   formattedEndDate,
                environments: initialEnvironmentsArray || [],
            });
            const modalInitialContents = modalInitialData.content.trim();
            setSubmissionDisabled(modalInitialContents.length == 0);
            //console.log('post setnotif, notificationData:', notificationData);
            //console.log('typeOf startDate:', typeof(formattedStartDate));
        } else {
            // otherwise, initialize for a new notification
            const blankEZNotification = createBlankEZNotification();
            setNotificationData(blankEZNotification);
        }
    }, [modalInitialData, editing]);

    if (!isModalOpen) {
        return (<div>&nbsp;</div>);
    } else {
        //console.log('notificationData at render time:', notificationData);
        const dtLabel = (<CustomLabelWithHint text="Start date/time (optional):" 
                         hintText="You can either set both dates, or only one date.  (All dates and times are stored internally in UTC.)   If you set just the Start date-time, this notification will be served forever, beginning at the Start date-time. If you set just an End date-time, the notification will stop being served after the End date-time. (All times shown are in your local timezone.)" />);
        const pgLabel = (<CustomLabelWithHint text="Page ID (optional)"
                         hintText="You can use any value you like here. When you pass a page ID value (or substring) in your SDK or API calls we will match against this value." />);
        const envLabel = (<CustomLabelWithHint text="Environments"
                          hintText="Depending on which environment you pass in via the SDK or an API call, we will serve to that environment if you specify it here." />);
        return ( 
            <div>
                <Modal
            title={editing ? 'Update this notification' : 'Create a new notification'}
            opened={isModalOpen}
            onClose={() => handleModalClose() }
            size="xl"
            radius="md"
            closeOnClickOutside={false}
            centered>
                <form onSubmit={handleSubmit} style={{margin:'10px'}} >
                <Paper>
            <Textarea
            name="content"
            radius="md"
            autosize
            value={notificationData?.content}
            minRows={4}
            maxRows={10}
            onChange={handleTextChange}
            label="Contents of this notification"
            placeholder="Enter notification text"
            description="Enter anything you want to show your users. (Markdown and HTML are OK too)."
                />
                <Group gap="xs">
                <DateTimePicker
            clearable
            valueFormat="MMM DD, YYYY HH:mm"
            label={dtLabel}
            value={notificationData?.startDate}
            onChange={(value) => handleDateTimeChange(value, 'startDate')}
            onClick={(value) => handleDateTimeClick(value, 'startDate')}
            onFocus={handleFocus}
            style={{marginTop:'10px',  minWidth:'90%', maxWidth:'200px'}}
                />
                <DateTimePicker
            clearable
            valueFormat="MMM DD, YYYY HH:mm"
            label="End date/time"
            value={notificationData?.endDate}
            onChange={(value) => handleDateTimeChange(value, 'endDate')}
            onFocus={handleFocus}
            style={{marginTop:'10px', minWidth:'90%', maxWidth:'200px'}}
                />
                <Expando
            closedTitle={`Your timezone: ${userTimezone}`}
            openTitle={`Your timezone: ${userTimezone}`}
            outerStyle={{marginTop:'10px', fontSize:'10px'}}
            titleStyle={{color:'#aaa'}}
            openOnDisplay={false}
                >
                <TimezonePicker />
                </Expando>
                </Group>
                <Expando
            closedTitle="Advanced options"
            openTitle="Advanced options"
            outerStyle={{marginTop:'20px'}}
            titleStyle={{color:'#aaa'}}
            openOnDisplay={editing}
                >
                <Paper p="sm">

            <TextInput
            name="pageId"
            value={(notificationData?.pageId ? notificationData.pageId : '')}
            onChange={handleTextChange}
            label={pgLabel}
            style={{marginTop:'0px'}}
            placeholder="Enter page ID"
            description="Enter an ID to limit this notification to a specific page or section of your application."
                />
                <Group gap="xl" align="start" style={{marginTop:'20px'}}>
            <NotificationTypeSelector
            value={notificationData?.notificationType as NotificationType}
            notificationTypeOther={(notificationData?.notificationTypeOther ? notificationData?.notificationTypeOther : null)}
            onSelectionChange={handleNotificationTypeChange}
            onCustomTypeChange={handleCustomNotificationTypeChange}
                />
                <MultiSelect
            name="environments"
            value={Array.isArray(notificationData?.environments) ? notificationData?.environments : []}
            pointer
            label={envLabel}
            description="Choose the environments to serve this notification to."
            placeholder="Pick values"
            data={['Development', 'Staging', 'UAT', 'Production']}
            comboboxProps={{ shadow: 'md' }}
            onChange={(value) => handleEnvironmentsChange(value)}
                />
            <Checkbox 
            checked={notificationData?.mustBeDismissed ? notificationData.mustBeDismissed : mustBeDismissed}
              onChange={handleMustBeDismissed} 
              label="Notification must be dismissed by end users"
            />
                </Group>
                </Paper>
                </Expando>
                </Paper>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
                <Button variant="filled" disabled={submissionDisabled} type="submit">{editing ? 'Update Notification' : 'Create Notification'}</Button>
                <Anchor component="button" type="button" onClick={handleModalClose} style={{marginLeft:'10px', color:'#999'}} >
                Cancel
            </Anchor>
                </div>
                {editing && (
                    <Text size="xs" style={{marginTop:'10px',paddingTop:'10px',marginLeft:'10px',borderTop:'1px solid #888'}}> 
                        {formatCreateInfo(notificationData)}
                    </Text>
                )}
            </form>
                </Modal>
                </div>
        );

    }
}

export default NotificationsModal;
