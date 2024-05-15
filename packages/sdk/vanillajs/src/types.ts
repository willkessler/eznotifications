export enum TargetInsertType {
  TargetInside = 'target-inside',
  TargetBefore = 'target-before',
  TargetAfter  = 'target-after',
};

export interface SDKConfiguration {
  api: {
    displayMode : string;
    userId: string;
    key: string;
    endpoint: string;
    environments?: string[];
    domains?: string[];
    dismissFunction?: (notificationUuid:string) => Promise<void>;
  };
  inline?: {
    target?: {
      outer: string;
      content: string;
      confirm: string;
      dismiss: string;
    },
    show?: {
      content: boolean;
      dismiss: boolean;
      confirm: boolean;
    },
  };
  toast?: {
    // One of these (from swal2):
    // 'top', 'top-start', 'top-end', 'center', 'center-start', 'center-end',
    // 'bottom', 'bottom-start', or 'bottom-end'.
    position?: string;
    duration?: number;
  };
  banner?: {
    duration?: 5000,
  };
  modal?: {
    confirmButtonLabel? : string;
  }
};
