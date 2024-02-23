import React, { createContext, useContext, useState, useCallback } from 'react';

const APIKeysContext = createContext({
    APIKeys: [],
    fetchAPIKeys: () => {},
    APIKeysLoading: true,
});

export const useAPIKeys = () => useContext(APIKeysContext);

export const APIKeysProvider = ({ children }) => {
    const [APIKeys, setAPIKeys] = useState([]);
    const [sandboxAPIKeys, setSandboxAPIKeys] = useState([]);
    const [APIKeysLastUpdated, setAPIKeysLastUpdated] = useState(null);
    const [APIKeysLoading, setAPIKeysLoading] = useState(true);
    const [productionAPIKeyValue, setProductionAPIKeyValue] = useState(null);

    const splitDevelopmentAndProductionKeys = (data: any) => {
        // pull out all development keys
        console.log('filtering on data:', data);
        const developmentKeys = data.filter(apiKeyRecord => 
          apiKeyRecord.apiKeyType === 'development' && apiKeyRecord.isActive === true);
        setAPIKeys(developmentKeys);
        const sandboxKeys = data.filter(apiKeyRecord => 
            apiKeyRecord.apiKeyType === 'development' && 
            apiKeyRecord.isActive === true &&
            apiKeyRecord.expiresAt !== null);
        setSandboxAPIKeys(sandboxKeys);
        const productionKeys = data.filter(apiKeyRecord => 
            apiKeyRecord.apiKeyType === 'production' && apiKeyRecord.isActive === true );
        console.log('developmentKeys:', developmentKeys);
        console.log('sandboxKeys:', sandboxKeys);
        console.log('productionKeys:', productionKeys);
        if (productionKeys.length > 0) {
            console.log('setting prod api key value');
            setProductionAPIKeyValue(productionKeys[0].apiKey);
        }
    };

    const fetchAPIKeys = useCallback(async (clerkId) => {
        setAPIKeysLoading(true); // start loading process
        try {
            const APIUrl = `${window.location.origin}/api/api-keys?clerkId=${clerkId}`;
            const response = await fetch(APIUrl);
            const data = await response.json();
            splitDevelopmentAndProductionKeys(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setAPIKeysLoading(false);
        }
    }, []);
    
    const createAPIKey = useCallback(async (apiKeyType, clerkId, temporary = false) => {
        const apiUrl = `${window.location.origin}/api/api-keys/create`;
        try {
            const response = await fetch(apiUrl, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ apiKeyType, clerkId, temporary }),
            });
            if (!response.ok) {
                throw new Error (`HTTP error! status: ${response.status}`);
            } else {
                console.log('created an API key');
                setAPIKeysLastUpdated(Date.now()); // trigger to refresh API keys
            }
        } catch (error) {
            console.error(`Error creating API key of type: ( ${apiKeyType} ).`, error);
            throw error;
        }
    });

    const toggleAPIKeyStatus = useCallback(async (APIKeyId, clerkId) => {
        try {
            const APIUrl = `${window.location.origin}/api/api-keys/toggle-active`;
            const response = await fetch(APIUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clerkId, APIKeyId }),
            });
            if (!response.ok) throw new Error(`Failed to toggle status of API key with id: ${APIKeyId}`);
            setAPIKeysLastUpdated(Date.now()); // update state to trigger the API keys list to rerender
        } catch (error) {
            console.error(`Error toggling APIKey with id:${APIKeyId}`, error);
            return false;
        } finally {
            setAPIKeysLoading(false);
        }
    }, []);
    
    return (
        <APIKeysContext.Provider value={{ 
            APIKeys,
            sandboxAPIKeys,
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
