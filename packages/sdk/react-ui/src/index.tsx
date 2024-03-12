import React, { ReactElement, useState, useEffect, ReactNode } from 'react';
import { SDKNotification, useSDKData, dismissNotificationCore } from '@thisisnotadrill/react-core';
import type { TinadTemplateProps, TinadNotificationsComponentProps } from './types';
export { TinadTemplateProps } from './types';
import isEqual from 'lodash/isEqual'; // If using Lodash for deep comparison
import _ from 'lodash';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import MicroModal from 'micromodal';
import microModalClasses from './micromodal.module.css';

// Internal template used only by the SDK.
const DefaultTemplate: React.FC<TinadTemplateProps> = ({ tinadContent, tinadType, dismiss }) => {
    return (
        <div>
            <div>Message: {tinadContent}</div>
            <div>Type:    {tinadType}</div>
            <div>{dismiss && <button onClick={dismiss}>Dismiss</button>}</div>
        </div>
    );
};

// The "mode" parameter allows clients to choose to use our built in modals or toasts for notifs if they want
// Possible values are: 'inline', 'modal', 'toast'.
export const TinadComponent: React.FC<TinadNotificationsComponentProps> = ({
    pageId,
    template: CustomTemplate = DefaultTemplate,
    mode = 'inline',
    clientDismissFunction,
}) => {
    const { data: sdkNotifications, isLoading, isError, error } = useSDKData(pageId);

    const [ currentNotifications, setCurrentNotifications ] = useState<SDKNotification[]>([]);
    const [ displayedIndex, setDisplayedIndex ] = useState<number>(-1);
    const [ isModalOpen, setIsModalOpen ] = useState(false);
    const [ modalContent, setModalContent ] = useState(null);

    useEffect(() => {
        if (mode === 'modal') {
            MicroModal.init({
                onShow: (modal) => console.log(`${modal.id} is shown`),
                onClose: (modal) => console.log(`${modal.id} is hidden`),
            });
        }
    }, [mode]);
             
    useEffect(() => {
        if (mode === 'modal' && isModalOpen) {
            setTimeout(() => {
                console.log('Showing micromodal');
                MicroModal.show('modal-1')
            }, 10000);
        }
    }, [mode, isModalOpen]);

    useEffect(() => {
        // Check if there are any notifications and update the modal's open state accordingly
        if (sdkNotifications && sdkNotifications.length > 0) {
            setIsModalOpen(true);
        } else {
            // Optionally, close the modal if there are no notifications
            setIsModalOpen(false);
        }
    }, [sdkNotifications]); // Depend on sdkNotifications to re-run the effect if it changes

    
    const dismissNotification = async () => {
        console.log('react-ui: dismissNotification');
        if (currentNotifications) {
            const dismissedNotificationUuid = currentNotifications[displayedIndex].uuid;
            console.log(`Dismissing notification with uuid ${dismissedNotificationUuid}`);
            // Call core SDK to actually execute the dismissal API call.
            await dismissNotificationCore(dismissedNotificationUuid);

            if (displayedIndex + 1 == currentNotifications.length) {
                console.log('Clearing currentNotifications');
                setCurrentNotifications([]);
                setDisplayedIndex(-1);
            } else {
                setDisplayedIndex(displayedIndex + 1);
            }
            // Call client-provided dismiss function as a side effect (if one was passed in).
            if (clientDismissFunction) {
                clientDismissFunction();
            }
        }
    };

    const renderMarkdown = (markdownText:string): { __html: string  } => {
        const rawMarkup = marked(markdownText) + '';
        const sanitizedMarkup = DOMPurify.sanitize(rawMarkup);
        return { __html:  sanitizedMarkup };
    };

    // Handle empty or error states
    if (isLoading) return <div>Loading...</div>;

    if (isError) {
        return <div>Error: {error?.message || "No notifications"}</div>;
    }

    if (sdkNotifications && sdkNotifications.length > 0) {
        if (!isEqual(currentNotifications, sdkNotifications)) {
            console.log(`New data received: ${JSON.stringify(sdkNotifications, null, 2)}`);
            console.log('Copying all notifications into currentNotifications.');
            setCurrentNotifications(_.cloneDeep(sdkNotifications));
            setDisplayedIndex(0);
        }
    }

    const TemplateToRender = CustomTemplate || DefaultTemplate;
    if (displayedIndex < 0) {
        console.log('No notifications to display');
        return null;
    }

    console.log('Returning datafull template where:');
    console.log(`displayedIndex: ${displayedIndex} currentNotifications ${currentNotifications?.length}`);
    // We do have a notification, so return its data merged into the template.
    const markedContent = renderMarkdown(currentNotifications[displayedIndex]?.content);
    switch (mode) {
        case 'modal':
            if (!isModalOpen) {
                return null;
            } else {
            return (
                <div id="modal-1" aria-hidden="true" className={microModalClasses.modal}>
                    <div tabIndex={-1} data-micromodal-close>
                        <div role="dialog" aria-modal="true" aria-labelledby="modal-1-title" >
                          <header>
                            <h2>TItle</h2>
                            <button aria-label="Close modal" 
                                data-micromodal-close 
                                className="modal__close" 
                                onClick={() => setIsModalOpen(false)}>Close</button>
                          </header>
                      <div id="modal-1-content" className="modal__content">
                        <div dangerouslySetInnerHTML={markedContent}></div>
                      </div>

                    </div>
                  </div>
                </div>
            )
            }
            break;
        case 'toast':
            break;
        case 'inline':
        default:
            return (
                <TemplateToRender
                tinadContent={<div dangerouslySetInnerHTML={markedContent}></div>}
                tinadType={currentNotifications[displayedIndex]?.notificationType}
                dismiss={dismissNotification}
                    />);
    }
}
