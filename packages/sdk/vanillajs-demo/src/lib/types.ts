export enum TargetInsertType {
  TargetInside = 'target-inside',
  TargetBefore = 'target-before',
  TargetAfter  = 'target-after',
};

export interface SDKConfiguration {
  api: {
    displayMode : string;
    userId?: string | undefined;
    key?: string;
    endpoint: string;
    environments?: string[];
    domains?: string[];
    dismissFunction?: (notificationUuid:string) => Promise<void>;
  };
  toast?: {
    // One of these (from swal2):
    // 'top', 'top-start', 'top-end', 'center', 'center-start', 'center-end',
    // 'bottom', 'bottom-start', or 'bottom-end'.
    position?: string;
    duration?: number;
  };
  modal?: {
    confirmButtonLabel? : string;
    show?: {
      confirm: boolean;
      dismiss: boolean;
    },
  };
  inline?: {
    target: {
      useDefaults?: boolean;
      outer?: string;
      content?: string;
      confirm?: string;
      dismiss?: string;
    },
    show?: {
      confirm: boolean;
      dismiss: boolean;
    },
  };
  banner?: {
    duration?: number;
    target: {
      useDefaults?:boolean;
      outer?: string;
      slideDown?: string;
      slideUp?: string;
      content?: string;
      dismiss?: string;
    },
    show?: {
      dismiss?: boolean;
    },
  };
};
