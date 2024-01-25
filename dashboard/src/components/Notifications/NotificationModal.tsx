import React, { useState, useRef, useEffect } from 'react';
import { Anchor, Button, Modal, Paper, Textarea, TextInput } from '@mantine/core';
import { DateTimePicker, DatePickerInput, TimeInput } from '@mantine/dates';
import { ActionIcon, rem } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import UserHint from '../../lib/UserHint';
import { useNotifications } from './NotificationsContext';

export const NotificationModal: React.FC = ({ opened, initialData, onSubmit, onClose }) => {
  const { refreshNotifications } = useNotifications();
  const editing = (initialData != null);
  console.log('initialData:', initialData, ' editing:', editing);

  const navigate = useNavigate();

  const [timeInputsDisabled, setTimeInputsDisabled] = useState(true);

  const [notificationData, setNotificationData] = useState({
    content: '',
    pageId: '',
    dateRange: [null, null],
    startTime: '',
    endTime: '',
    canceled: false
  });

  function formatTime(date) {
    if (!date) return '';

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  const handleTextChange = e => {
    setNotificationData({ ...notificationData, [e.target.name]: e.target.value });
  };

  const handleDateRangeChange = (value, name) => {
    console.log("date range change:", name, value);
    setNotificationData({ ...notificationData, [name]: value });
  };

  const handleDateTimeChange = (value, name) => {
    console.log("date time change, name=", name, "value=", value.target.value);
    setNotificationData({ ...notificationData, [name]: value.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Create a copy of notificationData
    const formData = { ...notificationData };

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

    console.log('Processed form data:', formData);

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

  useEffect(() => {
    let setDateRange = false;
    if (editing) {
      console.log('useEffect, initialState=', initialData);
      const formattedStartDate = new Date(initialData.startDate);
      const formattedEndDate = new Date(initialData.endDate);
      const formattedStartTime = formatTime(formattedStartDate);
      const formattedEndTime = formatTime(formattedEndDate);
      console.log('startDate type:', typeof startDate, 'endDate type:', typeof endDate);

      console.log('pre-iso');
      setNotificationData({
        ...initialData, // Spread the initialData
        editing: true,
        dateRange: [formattedStartDate, formattedEndDate],
        startTime: formattedStartTime,
        endTime: formattedEndTime
      });
      console.log('post setnotif');
      setDateRange = true;
    } else {
      setNotificationData({
        editing:false,
        content: '',
        pageId: '',
        dateRange: [null, null],
        startTime: '00:00',
        endTime: '00:00',
        canceled: false
      });
    }
  }, [initialData, editing]);

  useEffect(() => {
    // Enable or disable time inputs based on the dateRange
    const hasDateRange = notificationData.dateRange[0] && notificationData.dateRange[1];
    setTimeInputsDisabled(!hasDateRange);
  }, [notificationData.dateRange]);

  const customLabel1 = 
        (<CustomLabelWithHint text="Notification Display Dates" hintText="Select a calendar period during which your notification will be returned via the API. (Optional)" />);
  const customLabel2 = 
        (<CustomLabelWithHint text="Notification's display start time (optional)." hintText="If you provided display dates, you can optionally set the notification's display starting time on the first day." />);
  const customLabel3 = 
        (<CustomLabelWithHint text="Notification's display end time." hintText="If you provided display dates, you can optionally set the notification's last display time on the last day." />);
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
      <Modal title={editing ? 'Update this notification' : 'Create a new notification'} opened={opened} onClose={onClose} size="auto" centered>
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
              {notificationData.startTime &&
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
              }
              {notificationData.endTime &&
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
              }
            </div>
            <TextInput
              name="pageId"
              value={notificationData.pageId}
              onChange={handleTextChange}
              label="Page ID"
              style={{marginTop:'15px'}}
              placeholder="Enter page ID"
              description="(Optional) Enter a page ID you can use to target this notification."
            />
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
