import React, { useState, useRef, useEffect } from 'react';
import { Anchor, Button, Modal, Paper, Textarea, TextInput } from '@mantine/core';
import { DateTimePicker, DatePickerInput, TimeInput } from '@mantine/dates';
import { ActionIcon, rem } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import UserHint from './UserHint';
import { useNotifications } from './NotificationsContext';

export const NotificationModal: React.FC = ({ onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { refreshNotifications } = useNotifications();

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    refreshNotifications(); // Refresh the notifications list
  };

  const navigate = useNavigate();

  const [timeInputsDisabled, setTimeInputsDisabled] = useState(true);

  const [notificationData, setNotificationData] = useState({
    content: '',
    pageId: '',
    dateRange: [null, null],
    startTime: '00:00',
    endTime: '00:00',
    canceled: false
  });

  const handleCancel = () => {
    closeModal();
  };

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
    console.log('Type of onSubmit:', typeof onSubmit);

    e.preventDefault();

    console.log('before, NotificationData:', notificationData);
    [notificationData.startDate, notificationData.endDate] = notificationData.dateRange;
    if (notificationData.startDate != null) {

      // Check if startTime and endTime are provided; if not, set them to midnight
      if (!notificationData.startTime) {
        notificationData.startTime = '00:00'; // Default to midnight
      }

      if (!notificationData.endTime) {
        notificationData.endTime = '00:00'; // Default to midnight
      }

      // Parse the time strings into hours and minutes
      const [startHours, startMinutes] = notificationData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = notificationData.endTime.split(':').map(Number);

      // Set the time portion of the date objects to the parsed hours and minutes
      notificationData.startDate.setHours(startHours, startMinutes);
      notificationData.endDate.setHours(endHours, endMinutes);
    }
    console.log('after, NotificationData.startDate:', notificationData.startDate, 'notificationData.endDate:', notificationData.endDate);
    onSubmit(notificationData);
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

  useEffect(() => {
    if (notificationData.dateRange[0] && notificationData.dateRange[1]) {
      setTimeInputsDisabled(false); // Enable time inputs when date range is set
    } else {
      setTimeInputsDisabled(true); // Disable time inputs when date range is cleared
    }
  }, [notificationData.dateRange])


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
      <Button onClick={openModal} style={{ marginTop: '15px' }}>+ Create new notification</Button>

      <Modal title="Create a new notification" opened={isOpen} onClose={closeModal} size="auto" centered>
        <form onSubmit={handleSubmit} style={{margin:'10px'}} >
          <Paper padding="md">
            <Textarea
              name="content"
              radius="md"
              autosize
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
                  value={notificationData.dateRange}
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
            <TextInput
              name="pageId"
              onChange={handleTextChange}
              label="Page ID"
              style={{marginTop:'15px'}}
              placeholder="Enter page ID"
              description="(Optional) Enter a page ID you can use to target this notification."
            />
          </Paper>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
        <Button variant="filled" type="submit">Create</Button>
        <Anchor component="button" type="button" onClick={handleCancel} style={{marginLeft:'10px', color:'#999'}} >
          Cancel
        </Anchor>
      </div>
        </form>
      </Modal>
    </div>
  );
};
