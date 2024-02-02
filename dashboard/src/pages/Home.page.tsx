import React, { useEffect, useState } from 'react';
import { Anchor, Button, Code, Group, Image, Modal, Stack, Textarea, Text } from '@mantine/core';
import { renderMarkdown } from '../lib/RenderMarkdown';
import toast, { Toaster } from 'react-hot-toast';
import Banner from '../components/Banner/Banner';
import { UserButton, SignOutButton, SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react"

import {
    IconBellRinging,
    IconSpeakerphone,
    IconFingerprint,
    IconKey,
    IconSettings,
    Icon2fa,
    IconDatabaseImport,
    IconHelp,
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
import { NotificationModal }  from '../components/Notifications/NotificationModal'; // Adjust the path as needed
import { useNotifications } from '../components/Notifications/NotificationsContext';

export function HomePage() {

  const navigate = useNavigate();

  const [showBanner, setShowBanner] = useState(false);
  const [bannerContent, setBannerContent] = useState('');
  const [isModalOpen, setModalIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [previewModalOpened, setPreviewModalOpened] = useState(false);
  const [previewModalContents, setPreviewModalContents] = useState('');
  const { highlightNotification, refreshNotifications } = useNotifications();

  const isExternalLink = (url) => /^(http|https):\/\//.test(url); // tests if a string is a url
  const navBarData = [
    { link: '/dashboard', label: 'All Notifications', icon: IconSpeakerphone },
    { link: '', label: 'Billing', icon: IconReceipt2 },
    { link: '', label: 'API Keys', icon: IconKey },
    { link: '/settings', label: 'Account and Settings', icon: IconSettings },
    { link: 'https://tellyourusers-help-pages.super.site', label: 'Get Help', icon: IconHelp },
  ];

    const links = navBarData.map((item) => {
        const handleNavBarClick = (event) => {
            if (isExternalLink(item.link)) {
                // open external links in a new tab
                window.open(item.link, '_blank');
            } else {
                event.preventDefault();
                setActiveLink(item.label);
            }
        };

        return (
            <Anchor
            className={classes.link}
            data-active={item.label === activeLink || undefined}
            href={item.link}
            target={isExternalLink(item.link) ? '_blank' : '_self'}
            rel={isExternalLink(item.link) ? 'nopener noreferrer' : undefined}
            key={item.label}
            onClick={handleNavBarClick}
                >
                <item.icon className={classes.linkIcon} stroke={1.5} />
                <span>{item.label}</span>
                </Anchor>
        );
    });

  const goToNewNotification = () => {
    navigate('/new-notification'); // Use the path you've defined for the new notification form
  };

  const handleEdit = (notificationData) => {
    // Call API to update the notification
    // Then update the state or re-fetch notifications
    //console.log('notificationData=',notificationData);
    openModal(notificationData);
  };

  const handleCancel = (notificationId) => {
    // Call API to cancel the notification
    // Then update the state or re-fetch notifications
  };

  // Set up the demo banner
  const displayBanner = (bannerText) => {
    setBannerContent(bannerText);
    setShowBanner(true);
  };

  const closeBanner = () => {
      setShowBanner(false);
  }

  // preview of a notification modal (for the operator to see what their notification might look like in a modal)
  const displayPreviewModal = (contents) => {
    setPreviewModalContents(contents);
    setPreviewModalOpened(true);
  };

  const closePreviewModal = () => {
    setPreviewModalOpened(false);
  };

  // New notification modal
  const openModal = (notificationData = null) => {
    setModalData(notificationData);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalData(null);
  };

  const handleNotificationSubmit = (notificationData) => {
    //console.log('Notif data on form submit:', notificationData);
    const method = (notificationData.editing ? 'PUT' : 'POST' ); // PUT will do an update, POST will create a new posting
    const action = (notificationData.editing ? 'updated' : 'created' );
    const apiUrl = `/eznotifications` +
          (notificationData.editing ? '/' + notificationData.id : '/new');
    fetch(apiUrl, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData),
    })
      .then((response) => response.json())
      .then((data) => {
        //console.log('Notification ' + action, data);

        highlightNotification(data.id);
        refreshNotifications();
      })        
      .catch((error) => console.error('Error creating notification:', error));
  };

  return (
    <div className={classes.mainContainer}> {/* Main container */}
      <Toaster />
      <nav className={classes.navbar}>
        <div className={classes.navbarMain}>
          <Stack className={classes.header} align="center" justify="space-between">
              <Anchor href="/"><Image src="/ThisIsNotADrill_cutout.png" h={150} /></Anchor>
            <Code fw={700}>v1.0</Code>
          </Stack>
          {links}
          <Anchor
            className={classes.link}
          >
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <SignOutButton>
              <span>Log out</span>
            </SignOutButton>
          </Anchor>

        </div>

        <div className={classes.footer}>
        </div>
      </nav>

      <div className={classes.content}> {/* Main content area */}
        <div> { showBanner && <Banner message={bannerContent} onClose={closeBanner} /> } </div>
          <Group justify="space-between" style={{ marginBottom: '20px'}}>
          <Text size="xl" tt="capitalize" style={{ fontSize:'24px'}}>All Notifications</Text>
            <Button size="sm" onClick={() => { openModal(null) }} style={{ marginLeft: '15px' }}>+ Create new notification</Button>
          </Group>
        <div>
            <NotificationsList
              onEdit={handleEdit}
              onCancel={handleCancel}
              openModal={openModal}
              displayBanner={displayBanner}
              displayPreviewModal={displayPreviewModal}
              closePreviewModal={closePreviewModal}
            />
            {isModalOpen && (
              <NotificationModal
                opened={isModalOpen}
                initialData={modalData}
                onSubmit={handleNotificationSubmit}
                onClose={closeModal}
              />
            )}
          <Modal 
            size="60%"
            opened={previewModalOpened} 
            onClose={closePreviewModal}
            radius="md"
            centered>
            <div dangerouslySetInnerHTML={renderMarkdown(previewModalContents, true)}></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
              <Button onClick={() => { closePreviewModal() }}>OK</Button>
            </div>
          </Modal>

        </div>
      </div>
    </div>
  );
};
