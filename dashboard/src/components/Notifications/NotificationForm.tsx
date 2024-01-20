import React, { useState } from 'react';
import { Textarea, Button, Anchor } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useNavigate } from 'react-router-dom';

const NotificationForm = ({ onSubmit }) => {
  const navigate = useNavigate();

  const [notificationData, setNotificationData] = useState({
    content: '',
    pageId: '',
    startTime: null,
    endTime: null,
    canceled: false
  });

  const handleCancel = () => {
    navigate('/');
  };

  const handleChange = e => {
    setNotificationData({ ...notificationData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (value, name) => {
    console.log("date change:", name, value);
    setNotificationData({ ...notificationData, [name]: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(notificationData);
  };

  return (
    <form onSubmit={handleSubmit} style={{margin:'10px'}} >

      <Textarea
        name="content"
        radius="md"
        autosize
        minRows={2}
        maxRows={10}
        onChange={handleChange}
        label="Notification contents"
        placeholder="Enter notification text"
        description="Enter anything you want to show your users. You must parse whatever format you use on your end, for instance, markdown."
      />
        <DateTimePicker 
          name="startTime"
          value={notificationData.startTime}
          onChange={(value) => handleDateChange(value, 'startTime')}
          clearable 
          placeholder="(Optional) Choose start date/time" 
          style={{marginTop:'10px'}}
          />
        <DateTimePicker 
          name="endTime"
          value={notificationData.endTime}
          onChange={(value) => handleDateChange(value, 'endTime')}
          clearable 
          placeholder="(Optional) Choose end date/time (if start date set)" 
          style={{marginTop:'10px'}}
          />
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
        <Button variant="filled" type="submit">+ Create new notification</Button>
        <Anchor component="button" type="button" onClick={handleCancel} style={{marginLeft:'10px', color:'#999'}} >
          Cancel
        </Anchor>
      </div>
    </form>
  );
};

export default NotificationForm;
