import useSWR from 'swr';

import { v4 as uuidv4 } from 'uuid';

interface FetchParams {
    userId?: string;
    pageId?: string;
    environments?: string[];
}

export interface TinadNotification {
    content: string;
    pageId?: string;
    notificationType: string;
    environments: [string];
    startDate?: string;
    endDate?: string;
    live: boolean;
}

interface UseFetchDataReturn {
    data: TinadNotification[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: any;
}


const useFetchData = (params: FetchParams): UseFetchDataReturn => {
    console.log('SWR useFetchData');
    const apiUrl = new URL('http://localhost:5000/notifications');

    // Function to get a cookie by name
    const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        console.log(`Read back cookie: ${value}`);
        if (parts.length === 2) {
            const part = parts.pop();
            if (part) {
                return part.split(';').shift() || null;
            }
        }
        return null;
    };

    // Function to set a cookie
    const setCookie = (name: string, value: string, days: number) => {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `; expires=${date.toUTCString()}`;
        const cookieValue = `${name}=${value}${expires}; path=/`;
        console.log(`Setting cookie to : ${cookieValue}`);
        document.cookie = cookieValue;
    };

    // Function to generate a UUID
    const generateUniqueId = (): string  => {
        return 'tinad_user_' + uuidv4(); // This will generate a random UUID
    };

    const fetcher = async (apiUrl: string) => {
        console.log('Fetcher running on url:', apiUrl);
        const response = await fetch(apiUrl, {
            headers: {
                "Authorization": "Bearer KB4seNru"
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    };

    let userId = params.userId || getCookie('sdkUserId');
    let userIdWasProvided = true;
    if (!userId) {
        userId = generateUniqueId();
        console.log(`Generated user id ${userId}`);
        userIdWasProvided = false;
    }
    params.userId = userId; // ensure userId is included in params

    Object.keys(params).forEach(key => {
        if (key === 'userId' || key === 'pageId' || key === 'environments') {
            apiUrl.searchParams.append(key, params[key] as string);
        }
        if (key === 'environments') {
            (params[key] as string[]).forEach(value => apiUrl.searchParams.append(key, value));
        }
    });

    const { data, error, isLoading } = useSWR<TinadNotification[]>(apiUrl.toString(), fetcher, { 
        refreshInterval: 10000,
    });

    // Side effect to set the cookie
    if (!userIdWasProvided && !getCookie('sdkUserId')) {
        setCookie('sdkUserId', userId, 365); // Set for 365 days, for example
    }

    const returnObj =  {
        data,
        isLoading,
        isError: error,
        error,
    };
    console.log(`Returning this object: ${JSON.stringify(returnObj,null,2)}`);
    return returnObj;
};

export default useFetchData;
