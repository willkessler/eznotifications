import React, { useState, useRef, useEffect } from 'react';
import { Anchor, Button, Modal, MultiSelect, Paper, Textarea, TextInput } from '@mantine/core';
import { DateTimePicker, DatePickerInput, TimeInput } from '@mantine/dates';
import { ActionIcon, rem } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import UserHint from '../../lib/UserHint';
import Expando from '../../lib/Expando';
import { NotificationTypeSelector } from '../../lib/NotificationTypeSelector';
import { useNotifications } from './NotificationsContext';

export const NotificationModal: React.FC = ({ opened, initialData, onSubmit, onClose }) => {
  const { refreshNotifications } = useNotifications();
  const editing = (initialData != null);
  //console.log('initialData:', initialData, ' editing:', editing);

  const navigate = useNavigate();

  const [timeInputsDisabled, setTimeInputsDisabled] = useState(true);
  const [notificationType, setNotificationType] = useState('info'); // default is the "info" choice

  const [notificationData, setNotificationData] = useState({
    content: '',
    pageId: '',
    dateRange: [null, null],
    startTime: '',
    endTime: '',
    live: false,
    notificationType: 'info',
    notificationTypeOther: '',
    environments: [],
  });

  const handleNotificationTypeChange = (type) => {
    //console.log('handleNotificationTypeChange:', type);
    setNotificationData(prevData => ({
      ...prevData,
      notificationType: type,
    }));
  };

  const handleCustomNotificationTypeChange = (customType) => {
    //console.log('handleCustomNotificationTypeChange:', customType, 'notificationData.notificationType=', notificationData.notificationType);
    setNotificationData(prevData => ({
      ...prevData,
      notificationTypeOther: customType
    }));

  };

  const handleEnvironmentsChange = (values) => {
    //console.log('environments change:', values);
    setNotificationData(prevData => ({
      ...prevData,
      environments: values
    }));
  };

  const handleTextChange = e => {
    setNotificationData({ ...notificationData, [e.target.name]: e.target.value });
  };

  const handleDateRangeChange = (value, name) => {
    //console.log("date range change:", name, value);
    setNotificationData({ ...notificationData, [name]: value });
  };

  const handleDateTimeChange = (value, name) => {
    //console.log("date time change, name=", name, "value=", value.target.value);
    setNotificationData({ ...notificationData, [name]: value.target.value });
  };

  const handleSubmit = e => {
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


    console.log('Form data for submission=:', formData);

    // Use formData for submission or further processing
    onSubmit(formData);

    // Other necessary actions like closing the modal
    onClose();
  };

  const CustomLabelWithHint = ({ text, hintText }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span>{text}</span>
      <UserHint hintText={hintText}>
        <span />
      </UserHint>
    </div>
  );

  function formatTime(date) {
    if (!date) return '';

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    if (editing) {
      //console.log('useEffect. initialState=', initialData);
      const formattedStartDate = (initialData.startDate == null ? null : new Date(initialData.startDate));
      const formattedEndDate   = (initialData.endDate == null ? null : new Date(initialData.endDate));
      const formattedStartTime = formatTime(formattedStartDate);
      const formattedEndTime   = formatTime(formattedEndDate);
      const initialEnvironmentsArray = initialData.environments;
      //console.log('initialEnvironmentsArray:', initialEnvironmentsArray);

      //console.log('pre-iso', formattedStartDate, formattedStartTime);
      
      //console.log('pre setnotif, notificationData:', notificationData);
      setNotificationData({
        ...initialData, // Spread the initialData passed in for editing
        editing: true,
        dateRange: [formattedStartDate, formattedEndDate],
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        environments: initialEnvironmentsArray || [],
      });
      //console.log('post setnotif, notificationData:', notificationData);
    } else {
      // otherwise, initialize for a new notification
      setNotificationData({
        editing:false,
        content: '',
        pageId: '',
        dateRange: [null, null],
        startTime: '00:00',
        endTime: '00:00',
        live: false,
        environments: [],
      });
    }
  }, [initialData, editing]);

  useEffect(() => {
    // Enable or disable time inputs based on the dateRange
    const hasDateRange = notificationData.dateRange[0] && notificationData.dateRange[1];
    setTimeInputsDisabled(!hasDateRange);
  }, [notificationData.dateRange]);

  const customLabel1 = 
        (<CustomLabelWithHint text="Notification Display Dates:" hintText="Select a calendar period during which your notification will be returned via the API. (Optional)" />);
  const customLabel2 = 
        (<CustomLabelWithHint text="Starting display time on the first day:" hintText="If you provided display dates, you can optionally set the notification's display starting time on the first day." />);
  const customLabel3 = 
        (<CustomLabelWithHint text="Ending display time on the last day:" hintText="If you provided display dates, you can optionally set the notification's last display time on the last day. Make sure it's *after* the start time, if the display date is only one calendar day." />);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);

  const pickerControls = [
                       (
                       <ActionIcon variant="subtle" color="gray" onClick={() => ref1.current?.showPicker()}>
                         <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                       </ActionIcon>
                       ),
                       (
                       <ActionIcon variant="subtle" color="gray" onClick={() => ref2.current?.showPicker()}>
                         <IconClock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                       </ActionIcon>
                       )
                       ];

  return (
    <div>
      <Modal 
        title={editing ? 'Update this notification' : 'Create a new notification'} 
        opened={opened} 
        onClose={onClose} 
        size="auto" 
        radius="md"
        centered>
        <form onSubmit={handleSubmit} style={{margin:'10px'}} >
          <Paper padding="md">
            <Textarea
              name="content"
              radius="md"
              autosize
              value={notificationData.content}
              minRows={4}
              maxRows={10}
              onChange={handleTextChange}
              label="Notification's contents"
              placeholder="Enter notification text"
              description="Enter anything you want to show your users. You must parse whatever format you use on your end (for instance, markdown)."
            />
            <div style={{ display: 'flex', width: '90%' }}>
                <DatePickerInput
                  type="range"
                  name="dateRange"
                  value={[notificationData.dateRange[0], notificationData.dateRange[1]]}
                  onChange={(value) => handleDateRangeChange(value, 'dateRange')}
                  clearable
                  style={{marginTop:'10px'}}
                  label={customLabel1}
                  onBlur={() => {
                    if (!notificationData.dateRange[0] && !notificationData.dateRange[1]) {
                      setTimeInputsDisabled(true); // Disable time inputs if date range is cleared
                    }
                  }}
                />
                <TimeInput
                  name="startTime"
                  value={notificationData.startTime}
                  label={customLabel2}
                  onChange={(value) => handleDateTimeChange(value, 'startTime')}
                  ref={ref1}
                  rightSection={pickerControls[0]}
                  style={{marginTop:'10px', marginLeft:'10px'}}
                  disabled={timeInputsDisabled}
                />
                <TimeInput
                  name="endTime"
                  value={notificationData.endTime}
                  label={customLabel3}
                  onChange={(value) => handleDateTimeChange(value, 'endTime')}
                  ref={ref2}
                  rightSection={pickerControls[1]}
                  style={{marginTop:'10px', marginLeft:'10px'}}
                  disabled={timeInputsDisabled}
                />
            </div>
            <Expando 
              closedTitle="Show advanced options" 
              openTitle="Hide advanced options" 
              outerStyle={{marginTop: '10px', color:'#aaa'}} 
              openOnDisplay={editing}
            >
              <Paper shadow="sm" p="sm">
                <TextInput
                name="pageId"
                value={notificationData.pageId}
                onChange={handleTextChange}
                label="Page ID (Optional)"
                style={{marginTop:'15px'}}
                placeholder="Enter page ID"
                description="Enter a page ID you can use to target this notification."
                />
                <div style={{ display: 'flex', width: '90%' }}>
                  <NotificationTypeSelector 
                    value={notificationData.notificationType} 
                    notificationTypeOther={notificationData.notificationTypeOther}
                    onSelectionChange={handleNotificationTypeChange} 
                    onCustomTypeChange={handleCustomNotificationTypeChange} 
                  />
                <MultiSelect
                  name="environments"
                  value={Array.isArray(notificationData.environments) ? notificationData.environments : []}
                  style={{width:'375px', paddingTop:'20px', paddingLeft: '20px'}}
                  pointer
                  label="Environments"
                  description="Choose the environments to serve this notification to."
                  placeholder="Pick values"
                  data={['Development', 'Staging', 'UAT', 'Production']}
                  comboboxProps={{ shadow: 'md' }}
                  onChange={(value) => handleEnvironmentsChange(value)}
                />
                </div>
              </Paper>
            </Expando>
          </Paper>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
        <Button variant="filled" type="submit">{editing ? 'Update' : 'Create'}</Button>
        <Anchor component="button" type="button" onClick={onClose} style={{marginLeft:'10px', color:'#999'}} >
          Cancel
        </Anchor>
      </div>
        </form>
      </Modal>
    </div>
  );
};
