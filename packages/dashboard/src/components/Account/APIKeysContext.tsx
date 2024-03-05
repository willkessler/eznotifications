import React, { createContext, useContext, useState, useCallback } from 'react';
import type APIKey from '../../lib/shared_dts/APIKey';
import { useConfig } from '../../lib/ConfigContext';

interface APIKeysContextType {
    APIKeys: APIKey[];
    playgroundAPIKeys: APIKey[];
    fetchAPIKeys: (clerkId: any) => Promise<void>;
    APIKeysLoading: boolean;
    APIKeysLastUpdated: number | undefined;
    toggleAPIKeyStatus: (APIKeyId: string, clerkId: string) => Promise<boolean>;
    productionAPIKeyValue: string | null;
    createAPIKey: (apiKeyType: string, clerkId?: string, temporary?: boolean) => Promise<boolean>;
};

const APIKeysContext = createContext<APIKeysContextType>({
    APIKeys: [],
    playgroundAPIKeys: [],
    fetchAPIKeys: async (clerkId: any) => {},
    APIKeysLoading: false,
    APIKeysLastUpdated: 0,
    toggleAPIKeyStatus: (APIKeyId: string, clerkId: string) => Promise.resolve(true),
    productionAPIKeyValue: null,
    createAPIKey: (apiKeyType: string, clerkId?: string, temporary?: boolean) => Promise.resolve(true),
});

export const useAPIKeys = () => useContext(APIKeysContext);

export const APIKeysProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const { apiBaseUrl, getBearerHeader } = useConfig();
    const [APIKeys, setAPIKeys] = useState<APIKey[]>([]);
    const [playgroundAPIKeys, setPlaygroundAPIKeys] = useState<APIKey[]>([]);
    const [APIKeysLastUpdated, setAPIKeysLastUpdated] = useState<number>();
    const [APIKeysLoading, setAPIKeysLoading] = useState(true);
    const [productionAPIKeyValue, setProductionAPIKeyValue] = useState<string | null>('');

    const transformToAPIKey = (raw: any): APIKey => {
        return {
            uuid: raw.uuid,
            createdAt: new Date(raw.createdAt),
            updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : undefined,
            expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined,
            apiKey: raw.apiKey,
            apiKeyType: raw.apiKeyType,
            isActive: raw.isActive === 'true' || raw.isActive === true, // Assuming isActive comes as a string "true"/"false" or boolean
        };
    };

    const splitDevelopmentAndProductionKeys = (data: APIKey[]) => {
        // pull out all development keys

        console.log('filtering on data:', data);
        const developmentKeys = data
            .filter(apiKeyRecord => 
                apiKeyRecord.apiKeyType === 'development' && 
                !apiKeyRecord.expiresAt);
        setAPIKeys(developmentKeys);
        const playgroundKeys = data
            .filter(apiKeyRecord => 
                apiKeyRecord.apiKeyType === 'development' && 
                apiKeyRecord.isActive === true &&
                apiKeyRecord.expiresAt)
            .sort((a: APIKey, b: APIKey) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPlaygroundAPIKeys(playgroundKeys);
        const productionKeys = data.filter(apiKeyRecord => 
            apiKeyRecord.apiKeyType === 'production' && apiKeyRecord.isActive === true );
        console.log('developmentKeys:', developmentKeys);
        console.log('playgroundKeys:', playgroundKeys);
        console.log('productionKeys:', productionKeys);
        if (productionKeys.length > 0) {
            console.log('setting prod api key value');
            setProductionAPIKeyValue(productionKeys[0].apiKey);
        } else {
            setProductionAPIKeyValue(null);
        }
    };

    const fetchAPIKeys = useCallback(async (clerkId:string) => {
        setAPIKeysLoading(true); // start loading process
        try {
            const APIUrl = `${apiBaseUrl}/api-keys?clerkId=${clerkId}`;
            const response = await fetch(APIUrl, {
                method: 'GET',
                credentials: 'include',
                headers: await getBearerHeader(),
            });
            const data = await response.json();
            const apiKeys = data.map(transformToAPIKey);
            splitDevelopmentAndProductionKeys(apiKeys);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setAPIKeysLoading(false);
        }
    }, []);
    
    const createAPIKey = useCallback(async (apiKeyType:string, clerkId?:string, temporary:boolean = false) => {
        if (!clerkId) {
            return false;
        }
        const apiUrl = `${apiBaseUrl}/api-keys/create`;
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                credentials: 'include',
                headers: await getBearerHeader({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ 
                    apiKeyType, 
                    clerkId, 
                    temporary }),
            });
            if (!response.ok) {
                throw new Error (`HTTP error! status: ${response.status}`);
            } else {
                console.log('created an API key');
                setAPIKeysLastUpdated(Date.now()); // trigger to refresh API keys
            }
        } catch (error) {
            console.error(`Error creating API key of type: ( ${apiKeyType} ).`, error);
            return false;
        }
        return true;
    }, []);

    const toggleAPIKeyStatus = useCallback(async (APIKeyId:string, clerkId:string) => {
        try {
            const APIUrl = `${apiBaseUrl}/api-keys/toggle-active`;
            const response = await fetch(APIUrl, {
                method: 'POST',
                credentials: 'include',
                headers: await getBearerHeader({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ clerkId, APIKeyId }),
            });
            if (!response.ok) throw new Error(`Failed to toggle status of API key with id: ${APIKeyId}`);
            setAPIKeysLastUpdated(Date.now()); // update state to trigger the API keys list to rerender
        } catch (error) {
            console.error(`Error toggling APIKey with id:${APIKeyId}`, error);
            return false;
        } finally {
            setAPIKeysLoading(false);
            return true;
        }
    }, []);
    
    return (
        <APIKeysContext.Provider value={{ 
            APIKeys,
            playgroundAPIKeys,
            fetchAPIKeys,
            createAPIKey,
            APIKeysLoading,
            APIKeysLastUpdated,
            toggleAPIKeyStatus,
            productionAPIKeyValue,
        }}>
            {children}
        </APIKeysContext.Provider>
    );
};
