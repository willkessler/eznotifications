import React, { useEffect, useState } from 'react';
import { Button, Modal } from '@mantine/core';
import classes from './Banner.module.css';
import { renderMarkdown } from '../../lib/RenderMarkdown';
import { useNotifications } from '../Notifications/NotificationsContext';

const PreviewModal = () => {
  const { isPreviewModalOpen, 
          previewModalContent, 
          closePreviewModal,
          formatNotificationType, 
          previewNotificationType
        } = useNotifications();

    return (
        <Modal 
        size="60%"
        opened={isPreviewModalOpen} 
        onClose={closePreviewModal}
        radius="md"
        centered>
            <div>{formatNotificationType('', previewNotificationType, 58)}</div>          
            <div dangerouslySetInnerHTML={renderMarkdown(previewModalContent)}></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
            <Button onClick={() => { closePreviewModal() }}>OK</Button>
            </div>
            </Modal>
    );
};

export default PreviewModal;
