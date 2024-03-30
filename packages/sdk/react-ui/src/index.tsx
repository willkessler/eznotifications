import { ReactElement, useState, useEffect, ReactNode } from 'react';
import { useTinadSDK, useSDKData, SDKNotification } from '@this-is-not-a-drill/react-core';
import type { TinadTemplateProps, TinadNotificationsComponentProps } from './types';
export { TinadTemplateProps } from './types';
import isEqual from 'lodash/isEqual'; // If using Lodash for deep comparison
import _ from 'lodash';
import ReactMarkdown from 'react-markdown';
import Modal from 'react-modal';
import modalClasses from './react-modal.module.css';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toastify css
import tinadToastClasses from './react-toastify.module.css';
import IconSvgs from './iconSvgs.module';

// Internal template used only by the SDK for inlined notifications only
const DefaultTemplate: React.FC<TinadTemplateProps> = ({ tinadContent, tinadType, dismiss }) => {
    return (
      <div style={{ padding: '20px', backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)', width: '100%', borderRadius:'10px' }}>
        <div style={{ marginBottom: '10px' }}>{tinadContent}</div>
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
    environments = 'Development',
    clientDismissFunction,
}) => {
    const { data: sdkNotifications, isPending, isError, error, dismiss: dismissCore, getConfig } = useSDKData();
    const { tinadConfig, updateTinadConfig } = useTinadSDK();

    const [ currentNotifications, setCurrentNotifications ] = useState<SDKNotification[]>([]);
    const [ lastKnownUserId, setLastKnownUserId ] = useState<string | null>(null);
    const [ isModalOpen, setIsModalOpen ] = useState(false);
    const [ modalContent, setModalContent ] = useState(null);

    const customToastIcon = ( svgString:string ) => (
        <div dangerouslySetInnerHTML={{ __html: svgString }} />
    );

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        dismissNotification();
        setIsModalOpen(false);
    };

    const afterOpenModal = () => {
    };

    const addNewNotifications = () => {
        console.log(`addNewNotifications, adding ${sdkNotifications?.length} notifications`);
        if (sdkNotifications) {
          // Step 1: Filter out any existing notifications that do not match the current userId
          const relevantCurrentNotifications = currentNotifications.filter(
            notif => notif.userId === tinadConfig.userId
          );
          // Step 2: Add new notifications that match the current userId and are not already present
          const newNotifications = sdkNotifications.filter(
            notif => notif.userId === tinadConfig.userId &&
                   !relevantCurrentNotifications.some(cn => notif.uuid === cn.uuid)
          ).map(notif => _.cloneDeep(notif)); // Clone to ensure immutability

          if (newNotifications.length > 0 || relevantCurrentNotifications.length !== currentNotifications.length) {
            console.log(`Updating notifications. Total: ${relevantCurrentNotifications.length + newNotifications.length}`);
            setCurrentNotifications([...relevantCurrentNotifications, ...newNotifications]);
          }
        }
    };

    const dismissNotification = async () => {
        console.log('react-ui: dismissNotification');
        if (currentNotifications.length > 0) {
            console.log(`Dismissing notification with id ${currentNotifications[0].uuid}`);
            await dismissCore(currentNotifications[0].uuid);
            setCurrentNotifications(currentNotifications.slice(1));
            // Call client-provided dismiss function as a side effect (if one was passed in).
            if (clientDismissFunction) {
                clientDismissFunction();
            }
        }
    };

    useEffect(() => {
      Modal.setAppElement('#root');
    }, []);

    useEffect(() => {
      const newConfig = getConfig();
      if (pageId) {
        newConfig['pageId'] = pageId;
      }
      if (environments) {
        newConfig['environments'] = environments;
      }
      if (Object.keys(newConfig).length > 0) {
        updateTinadConfig(newConfig);
      }
    }, [updateTinadConfig]);
  

  useEffect(() => {
    console.log(`>>>> Checking sdkNotifications: ${JSON.stringify(sdkNotifications,null,2)}`);
    if (sdkNotifications && sdkNotifications.length > 0) {
      console.log('We need to add notifs');
      addNewNotifications();
    }
  }, [sdkNotifications]);

    useEffect(() => {
        // Check if there are any current notifications and update the modal's open state accordingly
        if (mode === 'toast' && currentNotifications.length > 0) {
            const notification = currentNotifications[0];
            console.log(`About to show toast on notification:${JSON.stringify(notification,null,2)}`);
            console.log(`Toast active: ${toast.isActive(notification.uuid)}`);
            if (notification && !toast.isActive(notification.uuid)) {
                setTimeout(() => {
                    toast.info(<ReactMarkdown>{notification.content}</ReactMarkdown> || '', {
                        toastId: notification.uuid,
                        icon: customToastIcon(IconSvgs[notification.notificationType].svg),
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                        transition: Bounce,
                        onClose: () => { dismissNotification() },
                    }) }, 50);
            }
        } else if (mode == 'modal' && currentNotifications.length > 0) {
          console.log(`>>> currentNotifications: ${currentNotifications}`);
          setIsModalOpen(true);
        } else {
          setIsModalOpen(false);
        }
    }, [currentNotifications]); // Rerun effect when currentNotifications or mode changes

    // Handle empty state
    if (isPending || (currentNotifications?.length == 0)) {
        return <div></div>;
    }

    // Handle error state
    if (isError) {
        console.log('*** TINAD error: Failed to fetch' || "No notifications");
        return <div></div>;
    }

    const TemplateToRender = CustomTemplate || DefaultTemplate;

    //console.log(`currentNotifications: ${JSON.stringify(currentNotifications,null,2)}`);
    console.log(`currentNotifications length: ${currentNotifications.length}`);
    // We do have a notification, so return its data merged into the template.
    const content = (currentNotifications[0] ? currentNotifications[0].content : '');
    //    const markedContent = renderMarkdown(currentNotifications[0]?.content);
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
                  contentLabel="Tinad modal"
                >
                    {<ReactMarkdown>content</ReactMarkdown>}
                    <button onClick={closeModal}>OK</button>
                 </Modal>
                </>
            );
        case 'toast':
            return (
                <ToastContainer
                  position="top-center"
                  className={tinadToastClasses.tinadCustomToast}
                  autoClose={5000}
                  hideProgressBar
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                  transition={Bounce}
                />
            );
        case 'inline':
        default:
            return (
                <TemplateToRender
                tinadContent={<ReactMarkdown>{content}</ReactMarkdown>}
                tinadType={currentNotifications[0]?.notificationType}
                dismiss={dismissNotification}
                    />);
    }
}
