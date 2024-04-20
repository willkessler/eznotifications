export interface OrganizationDataProps {
    organizationName: string;
    clerkEmail?: string;
    clerkCreatorId: string;
    clerkOrganizationId: string;
    permittedDomains: string;
    environments: string;
}

export interface CallbackOutcomes {
  createdClerkOrg: boolean;
  createdMirrorOrg: boolean;
  attachedLocalUser: boolean;
  savedSettings: boolean;
}

export interface SettingsContextType {
    isSetupComplete: boolean;
    setIsSetupComplete: (setupComplete: boolean) => void;
    organizationName: string;
    permittedDomains: string;
    environments: string;
    getSettings: () => Promise<OrganizationDataProps | null>;
    saveSettings: (clerkOrganizationId: string) => Promise<boolean>;
    setPermittedDomains: (domains: string) => void;
    setEnvironments: (environments: string) => void;
    createLocalUser:  (clerkUserId: string) => Promise<any>;
    createLocalOrganization: (organization: OrganizationDataProps) => Promise<boolean>;
    addUserToOurOrg:  (clerkOrganizationId: string) => Promise<boolean>;
    setupClerkOrganizationAndMirrorRecords: (callbackFn: (outcomes: CallbackOutcomes) => void) => Promise<boolean>;
    setOrganizationName: (name: string) => void;
    createdLocalUser: boolean;
    setCreatedLocalUser: (createdLocalUser: boolean) => void;
    createdLocalOrg: boolean;
    setCreatedLocalOrg: (createdLocalOrg: boolean) => void;
    getSigninTicket: (userId: string) => Promise<string | null>;
}
