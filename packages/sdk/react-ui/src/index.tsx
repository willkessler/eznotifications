import React, { ReactElement, useState, useEffect, ReactNode } from 'react';
import { SDKNotification, useSDKData, dismissNotificationCore } from '@thisisnotadrill/react-core';
import type { TinadTemplateProps, TinadNotificationsComponentProps } from './types';
export { TinadTemplateProps } from './types';
import isEqual from 'lodash/isEqual'; // If using Lodash for deep comparison
import _ from 'lodash';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Modal from 'react-modal';
import modalClasses from './react-modal.module.css';
import toastClasses from './react-hot-toast.module.css';
import toast, { Toaster } from 'react-hot-toast';
import IconSvgs from './iconSvgs.module';

// Internal template used only by the SDK for inlined notifications only
const DefaultTemplate: React.FC<TinadTemplateProps> = ({ tinadContent, tinadType, dismiss }) => {
    return (
      <div style={{ padding: '20px', margin: '10px', backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)', width: '100%', borderRadius:'20px' }}>
        <div style={{ marginBottom: '10px' }}>{tinadContent}</div>
        <div style={{ marginBottom: '10px' }}>{tinadType}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {dismiss && <button onClick={dismiss} className={modalClasses.dismiss}>Dismiss</button>}
        </div>
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
    let subtitle:any;
    const [ modalContent, setModalContent ] = useState(null);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        dismissNotification();
        setIsModalOpen(false);
    };

    const afterOpenModal = () => {
    };

    const toastNotify = (notification: SDKNotification) => { 
        console.log('toastNotify');
        const toastDuration = 5000;
        const content = (notification.content?.length == 0 ? '' : notification.content);
        const markedContent = renderMarkdown(content);
        const notificationType = (notification.notificationType? notification.notificationType : 'checkmark');
        const iconSvgString = IconSvgs[notificationType].svg ?? IconSvgs['default'].svg; // Fallback to a default icon if needed
        console.log(`iconSvgString: ${iconSvgString}`);
        const iconSvgColor = IconSvgs[notificationType].color ?? IconSvgs['default'].color; // Fallback to a default icon if needed
        const showToast = () => {
            const theToast = toast.custom((t) => (
                <div className={`${toastClasses.customToast} ${t.visible ? toastClasses.customToastVisible : ''} ${t.visible ? toastClasses.customToastAnimateEnter : ''}`} >
                    <div className={toastClasses.customToastContentWrapper}> {/* New wrapper div */}
                      <div style={{ color: iconSvgColor }} className={toastClasses.customToastIcon} dangerouslySetInnerHTML={{ __html: iconSvgString }} />
                      <div className={toastClasses.customToastContent} dangerouslySetInnerHTML={markedContent}></div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)}  className={toastClasses.customToastCloseButton}  aria-label="Close" >×</button>
                </div>
            ), {
                duration: toastDuration,
                position: 'top-center',
                
                // Styling
                style: {
                    minWidth:'50%',
                    transition: "all 0.25s ease-out"
                },
                className: '',

                // Aria
                ariaProps: {
                    role: 'status',
                    'aria-live': 'polite',
                },
            });
            setTimeout( () => {
                dismissNotification();
            }, toastDuration);
        };
        showToast();
    };

    useEffect(() => {
        Modal.setAppElement('#root');
    }, []);

    useEffect(() => {
        // Check if there are any notifications and update the modal's open state accordingly
        if (sdkNotifications && sdkNotifications.length > 0) {
            if (mode === 'modal') {
                setIsModalOpen(true);
            } else if (mode === 'toast') {
                toastNotify(currentNotifications[displayedIndex]);
            }
        } else {
            // Optionally, close the modal if there are no notifications
            if (mode === 'modal') {
                setIsModalOpen(false);
            }
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
        if (!markdownText) {
            console.error('Missing markdown content');
            return { __html: '' };
        }

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
            return (
                <>
                    <Modal 
                className={modalClasses.Modal}
                overlayClassName={modalClasses.Overlay}
                shouldCloseOnOverlayClick={false}
                  isOpen={isModalOpen}
                  onAfterOpen={afterOpenModal}
                  onRequestClose={closeModal}
                  contentLabel="Example Modal"
                >
                    {<div dangerouslySetInnerHTML={markedContent}></div>}
                    <button onClick={closeModal}>OK</button>
                 </Modal>
                </>
            );
        case 'toast':
            return (
                <><Toaster /></>
            );
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
