import { ReactElement, useState, useEffect, ReactNode } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toastify css
import { useTinadSDK, useSDKData } from '@this-is-not-a-drill/react-core';
import type { TinadTemplateProps, TinadNotificationsComponentProps } from './types';
export { TinadTemplateProps } from './types';
import isEqual from 'lodash/isEqual'; // If using Lodash for deep comparison
import _ from 'lodash';
import ReactMarkdown from 'react-markdown';
import Modal from 'react-modal';
import modalClasses from './react-modal.module.css';
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

const defaultToastProps = {
  position:"top-center", 
  autoClose:5000, 
  hideProgressBar: true, 
  rtl: false, 
  theme: "light", 
  transition: Bounce,
};

// The "mode" parameter allows clients to choose to use our built in modals or toasts for notifs if they want
// Possible values are: 'inline', 'modal', 'toast'.
export const TinadComponent: React.FC<TinadNotificationsComponentProps> = ({
    pageId,
    template: CustomTemplate = DefaultTemplate,
    mode = 'inline',
    environments = 'Development',
    toastProps=defaultToastProps,
    clientDismissFunction,
}) => {
    const { getTinadConfig, updateTinadConfig } = useTinadSDK();
    const { data: notificationsQueue, fetchPending, fetchError, dismiss: dismissCore } = useSDKData();
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

    const dismissNotification = async () => {
        console.log('react-ui: dismissNotification');
        if (notificationsQueue.length > 0) {
            console.log(`Dismissing notification with id ${notificationsQueue[0].uuid}`);
            await dismissCore(notificationsQueue[0].uuid);
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
      const newConfig = getTinadConfig();
      if (pageId) {
        newConfig['pageId'] = pageId;
      }
      if (environments) {
        newConfig['environments'] = environments;
      }
      if (Object.keys(newConfig).length > 0) {
        //console.log(`_+_+_+_+_+_+_+ New page navigated to, updating config with ${JSON.stringify(newConfig,null,2)}`);
        updateTinadConfig(newConfig);
      }
    }, [updateTinadConfig]);
  

    useEffect(() => {
        // Check if there are any current notifications and update the modal's open state accordingly
        if (mode === 'toast' && notificationsQueue.length > 0) {
            const notification = notificationsQueue[0];
            console.log(`About to show toast on notification:${JSON.stringify(notification,null,2)}`);
            console.log(`Toast active: ${toast.isActive(notification.uuid)}`);
            if (notification && !toast.isActive(notification.uuid)) {
              let toastFunc:any;
              switch(notification.notificationType) {
                case 'info':
                case 'change':
                case 'other':
                  toastFunc = toast.info;
                  break;
                case 'alert':
                case 'call_to_action':
                  toastFunc = toast.warning;
                  break;
                case 'outage':
                  toastFunc = toast.error;
                  break;
              }
              
              setTimeout(() => {
                    toastFunc(<ReactMarkdown>{notification.content}</ReactMarkdown> || '', {
                        toastId: notification.uuid,
                      // icon: customToastIcon(IconSvgs[notification.notificationType].svg),
                        position: (toastProps.position ? toastProps.position : defaultToastProps.position),
                        autoClose: (toastProps.autoClose ? toastProps.autoClose : defaultToastProps.autoClose),
                        hideProgressBar: (toastProps.hideProgressBar ? toastProps.hideProgressBar : defaultToastProps.hideProgressBar),
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: (toastProps.theme ? toastProps.theme : defaultToastProps.theme),
                        transition: (toastProps.transition ? toastProps.transition : defaultToastProps.transition),
                        onClose: () => { dismissNotification() },
                    }) }, 50);
            }
        } else if (mode == 'modal' && notificationsQueue.length > 0) {
          //console.log(`>>> notificationsQueue: ${JSON.stringify(notificationsQueue, null, 2)}`);
          setIsModalOpen(true);
        } else {
          //console.log(`>>> notificationsQueue (inline): ${JSON.stringify(notificationsQueue, null, 2)}`);
          setIsModalOpen(false);
        }
    }, [notificationsQueue]); // Rerun effect when currentNotifications or mode changes

    if (notificationsQueue?.length == 0) { // no notifications in queue
      return null;
    }

    // Handle error state
    if (fetchError) {
        console.log('*** TINAD error: Failed to fetch' || "No notifications");
        return <div></div>;
    }

    const TemplateToRender = CustomTemplate || DefaultTemplate;

    //console.log(`notificationsQueue: ${JSON.stringify(notificationsQueue,null,2)}`);
    console.log(`notificationsQueue length: ${notificationsQueue.length}`);
    // We do have a notification, so return its data merged into the template.
    const content = (notificationsQueue[0] ? notificationsQueue[0].content : '');
    //    const markedContent = renderMarkdown(notificationsQueue[0]?.content);
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
              <ToastContainer />
            );
        case 'inline':
        default:
            return (
              <TemplateToRender
                tinadContent={<ReactMarkdown>{content}</ReactMarkdown>}
                tinadType={notificationsQueue[0]?.notificationType}
                dismiss={dismissNotification}
              />);
    }
}
