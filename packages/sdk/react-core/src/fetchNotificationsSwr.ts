import useSWR from 'swr';
import { v4 as uuidv4 } from 'uuid';

interface FetchParams {
    userId?: string;
    pageId?: string;
    environments?: string[];
}

export interface TinadNotification {
    id: string,
    createdAt: Date,
    content: string;
    pageId?: string;
    notificationType: string;
    environments: [string];
    startDate?: Date;
    endDate?: Date;
    live: boolean;
}

interface UseFetchDataReturn {
    data: TinadNotification[] | null;
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

    const fetcher = async (apiUrl: string): Promise<TinadNotification[]> => {
        console.log('Fetcher running on url:', apiUrl);
        const response = await fetch(apiUrl, {
            headers: {
                "Authorization": "Bearer KB4seNru"
            }
        });
        console.log('Fetcher ran fetch');
        if (!response.ok) {
            console.log('network error');
            throw new Error('Network response was not ok');
        }
        console.log('Fetcher fetching json');
        const data = await response.json();
        console.log('Fetcher mapping');
        return data.map((notification: any) => ({
            ...notification,
            createdAt: new Date(notification.createdAt),
            startDate: notification.startDate ? new Date(notification.startDate) : undefined,
            endDate: notification.endDate ? new Date(notification.endDate) : undefined,
        }));
    };

    // Function to determine the latest date between startDate and endDate
    const getLatestDate = (startDate?: Date, endDate?: Date): Date => {
        if (!startDate) return endDate!;
        if (!endDate) return startDate;
        return startDate > endDate ? startDate : endDate;
    };


    const sortAndGroupNotifications = (data: TinadNotification[]): TinadNotification[] => {
        // Sort the results into two (subsorted) groups, those with start and/or end dates, and those without.
        const noDateNotifications: TinadNotification[] = [];
        const withDateNotifications: TinadNotification[] = [];

        console.log(`Got data: ${JSON.stringify(data)}`);
        data.forEach((notification: any) => { // 
            // Convert date strings to Date objects
            const tinadNotification: TinadNotification = {
                ...notification,
                createdAt: new Date(notification.createdAt),
                startDate: notification.startDate ? new Date(notification.startDate) : undefined,
                endDate: notification.endDate ? new Date(notification.endDate) : undefined,
            };

            if (!tinadNotification.startDate && !tinadNotification.endDate) {
                noDateNotifications.push(tinadNotification);
            } else {
                withDateNotifications.push(tinadNotification);
            }
        });

        // Sort noDateNotifications by createdAt descending
        noDateNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Sort withDateNotifications by the logic described
        withDateNotifications.sort((a, b) => {
            const latestDateA = getLatestDate(a.startDate, a.endDate);
            const latestDateB = getLatestDate(b.startDate, b.endDate);
            return latestDateB.getTime() - latestDateA.getTime(); // Assuming you want the most recent date first
        });

        // Concatenate the two arrays, with noDateNotifications first
        const sortedNotifications = noDateNotifications.concat(withDateNotifications);
        return sortedNotifications;
    };

    //
    // Main code for SDK starts here
    //

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

    const apiUrlString = apiUrl.toString();
    console.log('Fetching data from : ' + apiUrlString);
    const { data, error, isLoading } = useSWR<TinadNotification[]>(apiUrlString, fetcher, { 
        refreshInterval: 10000,
    });

    // Side effect to set the cookie
    if (!userIdWasProvided && !getCookie('sdkUserId')) {
        setCookie('sdkUserId', userId, 365); // Set for 365 days, for example
    }

    // Only process data if it's not undefined
    const sortedAndGroupedNotifications = data ? (data.length > 0 ? sortAndGroupNotifications(data) : []) : null;

    const returnObj: UseFetchDataReturn = {
        data: sortedAndGroupedNotifications,
        isLoading: !data && !error,
        isError: !!error,
        error,
    };
    console.log(`Returning this object: ${JSON.stringify(returnObj,null,2)}`);
    return returnObj;
};

export default useFetchData;
