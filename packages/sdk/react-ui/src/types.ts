import { ToastPosition, ToastTransition } from 'react-toastify';

// Exported to clients so they can remain aligned with
// future additions to the template parameters.
export interface TinadTemplateProps {
  tinadContent: React.ReactNode;
  tinadType: string;
  dismiss?: () => void;
}

export interface TinadNotificationsComponentProps {
  pageId?: string;
  template?: React.ComponentType<TinadTemplateProps>;
  mode?: string;
  toastProps? : { position: ToastPosition, autoClose: number, hideProgressBar: boolean, rtl: boolean, theme: string, transition: ToastTransition };
  clientDismissFunction?: () => void;
}
