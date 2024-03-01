import React, { useEffect, useState } from 'react';
import classes from './PreviewBanner.module.css';
import { renderMarkdown } from '../../lib/RenderMarkdown';
import { useNotifications } from '../Notifications/NotificationsContext';
import {  IconInfoCircle, IconAlertTriangle, IconExchange,
          IconCloudStorm, IconExclamationCircle, IconDots,
          IconSpeakerphone} from '@tabler/icons-react';
import { NotificationType } from '../../lib/shared_dts/NotificationsContext.d';

const PreviewBanner = () => {
  const { isPreviewBannerVisible, 
          previewBannerContent, 
          closePreviewBanner,
          formatNotificationType, 
          previewNotificationType
        } = useNotifications();
  const [ isClosing, setIsClosing ] = useState<null|boolean>(false);

  const handleClose = () => {
    setIsClosing(true); // start closing animation
  };

  useEffect(() => {
    // Automatically start closing after 4 seconds
    const autoCloseTimer = setTimeout(() => {
      if (isPreviewBannerVisible && !isClosing) {
        setIsClosing(true);
      }
    }, 4000); // 4 seconds

    // Cleanup timer
    return () => clearTimeout(autoCloseTimer);
  }, [isPreviewBannerVisible, isClosing]);

  useEffect(() => {
    if (isClosing) {
      const animationTimer = setTimeout(() => {
        closePreviewBanner(); // Call after 5 seconds
        setIsClosing(false); // reset closing state for next go round
      }, 250);


      return () => clearTimeout(animationTimer);
    }
  }, [isClosing, closePreviewBanner]);

  const caveatedBannerContent = renderMarkdown(previewBannerContent);
  return (
    isPreviewBannerVisible && (
      <div
        className={`${classes.banner} ${isClosing ? classes.slideUp : ''}`}
        onAnimationEnd={() => isClosing && closePreviewBanner()}
      >
        <div>{formatNotificationType('', previewNotificationType as NotificationType, 58)}</div>
        <div dangerouslySetInnerHTML={caveatedBannerContent}></div>
        <button className={classes.closeButton} onClick={handleClose}>X</button>
      </div>
    )
  );
};

export default PreviewBanner;
