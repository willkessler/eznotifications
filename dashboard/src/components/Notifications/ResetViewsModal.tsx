import React, { useEffect, useState } from 'react';
import { Anchor, Button, Modal, Text } from '@mantine/core';
import classes from './Banner.module.css';
import { renderMarkdown } from '../../lib/RenderMarkdown';
import { useNotifications } from '../Notifications/NotificationsContext';
import { useUser } from "@clerk/clerk-react";

const ResetViewsModal = () => {
  const { user } = useUser();
  const { isResetViewsModalOpen, resetViewsNotification, closeResetViewsModal, resetViewsNotificationContents } = useNotifications();
  const doubleCheckContentsMd = renderMarkdown(resetViewsNotificationContents, false);
  
  return (
    <Modal.Root size="lg" opened={isResetViewsModalOpen} onClose={closeResetViewsModal} radius="md" centered>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title style={{fontSize:'24px', fontWeight:'800', color:'#d33'}}>Please confirm!</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <div style={{marginBottom:'10px'}}>
            Do you wish to restart user viewing for the notification shown below?
          </div>
          <div style={{ border: '1px dashed #666', padding:'10px'}}>
            <div dangerouslySetInnerHTML={doubleCheckContentsMd}></div>
          </div>
          <Text size="sm" style={{fontStyle:'italic', paddingTop:'6px'}}>Please note: this will delete all the viewing history for this notification.</Text>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems:'center', marginTop:'30px' }}>
            <Anchor onClick={() => { closeResetViewsModal() }} style={{ marginRight:'10px', color:'#999'}}>Cancel</Anchor>
            <Button onClick={() => { resetViewsForNotification() }}>OK</Button>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
    );
};

export default ResetViewsModal;
