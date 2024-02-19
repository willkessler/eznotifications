import React, { useEffect, useState } from 'react';
import { Anchor, Button, Modal } from '@mantine/core';
import classes from './Banner.module.css';
import { renderMarkdown } from '../../lib/RenderMarkdown';
import { useNotifications } from '../Notifications/NotificationsContext';
import { useUser } from "@clerk/clerk-react";

const DeleteModal = () => {
  const { user } = useUser();
  const { isDeleteModalOpen, deleteNotification, closeDeleteModal, deletedNotificationContents } = useNotifications();
  const doubleCheckContentsMd = renderMarkdown(deletedNotificationContents);
  
  return (
    <Modal.Root size="lg" opened={isDeleteModalOpen} onClose={closeDeleteModal} radius="md" centered>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title style={{fontSize:'24px', fontWeight:'800', color:'#d33'}}>Please confirm!</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <div style={{marginBottom:'10px'}}>
            Do you wish to delete the notification shown below?
          </div>
          <div style={{ border: '1px dashed #666', padding:'10px'}}>
            <div dangerouslySetInnerHTML={doubleCheckContentsMd}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems:'center', marginTop:'30px' }}>
            <Anchor onClick={() => { closeDeleteModal() }} style={{ marginRight:'10px', color:'#999'}}>Cancel</Anchor>
            <Button onClick={() => { deleteNotification() }}>OK</Button>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
    );
};

export default DeleteModal;
