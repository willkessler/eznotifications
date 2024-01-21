import React, { useEffect, useState } from 'react';
import { Group, Code } from '@mantine/core';
import {
  IconBellRinging,
  IconFingerprint,
  IconKey,
  IconSettings,
  Icon2fa,
  IconDatabaseImport,
  IconReceipt2,
  IconSwitchHorizontal,
  IconLogout,
} from '@tabler/icons-react';
import classes from './NavbarSimple.module.css';

import { useNavigate } from 'react-router-dom';
import { Welcome } from '../components/Welcome/Welcome';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Home } from '../components/Home/Home';
import { NotificationsList } from '../components/Notifications/NotificationsList';
import NotificationModal from '../components/Notifications/NotificationModal'; // Adjust the path as needed
import { NotificationsProvider } from '../components/Notifications/NotificationsContext';

import { Textarea, Button, Anchor } from '@mantine/core';

export function HomePage() {

  const navigate = useNavigate();

  const navBarData = [
    { link: '', label: 'Notifications', icon: IconBellRinging },
    { link: '', label: 'Billing', icon: IconReceipt2 },
    { link: '', label: 'Security', icon: IconFingerprint },
    { link: '', label: 'SSH Keys', icon: IconKey },
    { link: '', label: 'Databases', icon: IconDatabaseImport },
    { link: '', label: 'Authentication', icon: Icon2fa },
    { link: '', label: 'Other Settings', icon: IconSettings },
  ];

  const [activeLink, setActiveLink] = useState('Notifications');

  const links = navBarData.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === activeLink || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActiveLink(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  const goToNewNotification = () => {
    navigate('/new-notification'); // Use the path you've defined for the new notification form
  };

  const handleEdit = (notificationId, updatedData) => {
    // Call API to update the notification
    // Then update the state or re-fetch notifications
  };

  const handleCancel = (notificationId) => {
    // Call API to cancel the notification
    // Then update the state or re-fetch notifications
  };

  const handleNewNotificationSubmit = (notificationData) => {
    fetch(`${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/eznotifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Notification created:', data);
        // Redirect to notifications list or show a success message
      })
      .then((data) => {
        navigate('/');
      })        
      .catch((error) => console.error('Error creating notification:', error));
  };

return (
    <div className={classes.mainContainer}> {/* Main container */}
      <nav className={classes.navbar}>
        <div className={classes.navbarMain}>
          <Group className={classes.header} justify="space-between">
            <h3>EZNotifications</h3>
            <Code fw={700}>v1.0</Code>
          </Group>
          {links}
        </div>

        <div className={classes.footer}>
          <Anchor component="button" type="button" >
            Log out
          </Anchor>
        </div>
      </nav>

      <div className={classes.content}> {/* Main content area */}
        <h1>Notifications</h1>
        <div>
          <NotificationsProvider>
            <NotificationsList
              onEdit={handleEdit}
              onCancel={handleCancel}
            />
            <NotificationModal onSubmit={handleNewNotificationSubmit} />
          </NotificationsProvider>
        </div>
      </div>
    </div>
);
};
