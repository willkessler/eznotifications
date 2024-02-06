import React, { useState, useRef, useEffect } from 'react';
import { Anchor, Button, Modal, MultiSelect, Paper, Textarea, TextInput } from '@mantine/core';
import { DateTimePicker, DatePickerInput, TimeInput } from '@mantine/dates';
import { ActionIcon, rem } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';

import UserHint from '../../lib/UserHint';
import Expando from '../../lib/Expando';
import { NotificationTypeSelector } from '../../lib/NotificationTypeSelector';
import { useNotifications } from './NotificationsContext';

const NotificationsModal = () => {
  const { isModalOpen, modalInitialData, closeModal, submitNotification } = useNotifications();
  const editing = (modalInitialData != null);
  //console.log('modalInitialData:', modalInitialData, ' editing:', editing);

  const [timeInputsDisabled, setTimeInputsDisabled] = useState(true);
  const [notificationType, setNotificationType] = useState('info'); // default is the "info" choice

  const [notificationData, setNotificationData] = useState({
      content: '',
      pageId: '',
      startDate:null,
      endDate: null,
      live: false,
      notificationType: 'info',
      nnotificationTypeOther: '',
      environments: [],
      deleted:false,
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

  const handleDateTimeChange = (value, name) => {
      if ((name === 'startDate') && (value === null)) {
          // instantly clear both dates, if user clears the startDate
          setNotificationData(prevData => ({
              ...prevData,
              startDate: null,
              endDate: null,
          }));
      } else if ((name === 'startDate') && (value && value >= notificationData.endDate)) {
          setNotificationData(prevData => ({
              ...prevData,
              startDate: value,
              endDate: null,
          }));
      } else if ((name === 'endDate') && (value && value <= notificationData.startDate)) {
          setNotificationData(prevData => ({
              ...prevData,
              startDate: null,
              endDate: value,
          }));
      } else {
          setNotificationData({ ...notificationData, [name]: value  });
      }
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
        formData.updatedAt = new Date().toISOString();
    } else {
        formData.updatedAt = null;
    }

    console.log('Form data for submission=:', formData);

    // Use formData for submission or further processing
    submitNotification(formData);

    // Other necessary actions like closing the modal
    closeModal();
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
        //console.log('post setnotif, notificationData:', notificationData);
        //console.log('typeOf startDate:', typeof(formattedStartDate));
    } else {
      // otherwise, initialize for a new notification
      setNotificationData({
        editing:false,
        content: '',
        pageId: '',
        startDate: null,
        endDate: null,
        live: false,
        environments: [],
      });
    }
  }, [modalInitialData, editing]);

    if (!isModalOpen) {
        return (<div>&nbsp;</div>);
    } else {
        //console.log('notificationData at render time:', notificationData);
        const dtLabel = (<CustomLabelWithHint text="Start date/time (optional):" 
                         hintText="You can either set both dates, or only one date. If you set just the start date/time, this notification will be served forever, AFTER the start date. If you set just an end date/time, the notification will never be served again, AFTER the end date." />);
        return ( 
    <div>
      <Modal
        title={editing ? 'Update this notification' : 'Create a new notification'}
        opened={isModalOpen}
        onClose={closeModal}
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
                <DateTimePicker
                  clearable
                  valueFormat="MMM DD, YYYY HH:mm"
                  label={dtLabel}
                  value={notificationData.startDate}
                  onChange={(value) => handleDateTimeChange(value, 'startDate')}
                  style={{marginTop:'10px', minWidth:'150px'}}
               />
                <DateTimePicker
                  clearable
                  valueFormat="MMM DD, YYYY HH:mm"
                  label="End date/time"
                  value={notificationData.endDate}
                  onChange={(value) => handleDateTimeChange(value, 'endDate')}
                  style={{marginTop:'10px', marginLeft:'10px', minWidth:'150px'}}
               />
            </div>
            <Expando
              closedTitle="Advanced options"
              openTitle="Advanced options"
              outerStyle={{marginTop:'10px'}}
              titleStyle={{color:'#aaa'}}
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
        <Anchor component="button" type="button" onClick={closeModal} style={{marginLeft:'10px', color:'#999'}} >
          Cancel
        </Anchor>
      </div>
        </form>
      </Modal>
    </div>
  );

    }
}

export default NotificationsModal;
