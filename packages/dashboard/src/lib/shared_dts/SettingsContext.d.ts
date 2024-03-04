export interface OrganizationDataProps {
    organizationName: string,
    clerkEmail?: string,
    clerkCreatorId: string,
    clerkOrganizationId: string,
    timezone: string,
    permittedDomains: string,
    refreshFrequency: number,
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
    timezone: string;
    setTimezone: (timezone: string) => void;
    refreshFrequency: number;
    permittedDomains: string;
    getSettings: () => Promise<OrganizationDataProps | null>;
    saveSettings: (clerkOrganizationId: string) => Promise<boolean>;
    setPermittedDomains: (domains: string) => void;
    setRefreshFrequency: (frequency: number) => void;
    createLocalUser:  (clerkUserId: string) => Promise<any>;
    createLocalOrganization: (organization: OrganizationDataProps) => Promise<boolean>;
    addUserToOurOrg:  (clerkOrganizationId: string) => Promise<boolean>;
    setupClerkOrganizationAndMirrorRecords: (callbackFn: (outcomes: CallbackOutcomes) => void) => Promise<boolean>;
    setOrganizationName: (name: string) => void;
    createdLocalUser: boolean;
    setCreatedLocalUser: (createdLocalUser: boolean) => void;
    createdLocalOrg: boolean;
    setCreatedLocalOrg: (createdLocalOrg: boolean) => void;
}
