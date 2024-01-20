import React, { useState } from 'react';
import { Textarea, Button, Anchor } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useNavigate } from 'react-router-dom';

const NotificationForm = ({ onSubmit }) => {
  const navigate = useNavigate();

  const [notificationData, setNotificationData] = useState({
    content: '',
    pageId: '',
    startDate: '',
    endDate: '',
    canceled: false
  });

  const handleCancel = () => {
    navigate('/');
  };

  const handleChange = e => {
    setNotificationData({ ...notificationData, [e.target.name]: e.target.value });
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
          name="startDate"
          onChange={handleChange}
          clearable 
          placeholder="(Optional) Choose start date/time" 
          style={{marginTop:'10px'}}
          />
        <DateTimePicker 
          name="endDate"
          onChange={handleChange}
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
