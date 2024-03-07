import useSWR from 'swr';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { SDKConfig, SDKNotification, SDKDataReturn } from './types';
export { SDKConfig, SDKNotification, SDKDataReturn } from './types';
import { getSDKConfig, setSDKConfig } from './config';

//console.log('the core index file');
// Main TINAD core initialization function.
const init = (config: Partial<SDKConfig>) : void => {
    setSDKConfig(config);
}

const useSDKData = (pageId?: string) => {
    console.log('TINAD: useSDKData');
    let sdkConfig = getSDKConfig();
    
    const apiUrl = new URL(sdkConfig.apiBaseUrl + '/notifications');

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

    const fetcher = async (apiUrl: string): Promise<SDKNotification[]> => {
        //console.log('Fetcher running on url:', apiUrl);
        const apiKey = getSDKConfig().apiKey;
        const response = await fetch(apiUrl, {
            headers: {
                "Authorization": "Bearer " + apiKey,
            }
        });
        //console.log('Fetcher ran fetch');
        if (!response.ok) {
            console.log('network error');
            throw new Error('Network response was not ok');
        }
        //console.log('Fetcher fetching json');
        const data = await response.json();
        //console.log('Fetcher mapping');
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


    const sortAndGroupNotifications = (data: SDKNotification[]): SDKNotification[] => {
        // Sort the results into two (subsorted) groups, those with start and/or end dates, and those without.
        const noDateNotifications: SDKNotification[] = [];
        const withDateNotifications: SDKNotification[] = [];

        //console.log(`sortAndGroupNotifications got data: ${JSON.stringify(data)}`);
        data.forEach((notification: any) => { // 
            // Convert date strings to Date objects
            const sdkNotification: SDKNotification = {
                ...notification,
                createdAt: new Date(notification.createdAt),
                startDate: notification.startDate ? new Date(notification.startDate) : undefined,
                endDate: notification.endDate ? new Date(notification.endDate) : undefined,
            };

            if (!sdkNotification.startDate && !sdkNotification.endDate) {
                noDateNotifications.push(sdkNotification);
            } else {
                withDateNotifications.push(sdkNotification);
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

    let userId = sdkConfig.userId || getCookie('sdkUserId');
    let userIdWasProvided = true;
    if (!userId) {
        userId = generateUniqueId();
        console.log(`Generated user id ${userId}`);
        userIdWasProvided = false;
    }
    apiUrl.searchParams.append('userId', userId);
    apiUrl.searchParams.append('pageId', sdkConfig.pageId as string);
    (sdkConfig.environments as string[]).forEach(value => apiUrl.searchParams.append('environments', value));

    const apiUrlString = apiUrl.toString();
    console.log('Fetching data from : ' + apiUrlString);
    const { data, error, isLoading } = useSWR<SDKNotification[]>(apiUrlString, fetcher, { 
        refreshInterval: 5000,
    });

    // Side effect to set the cookie
    if (!userIdWasProvided && !getCookie('sdkUserId')) {
        setCookie('sdkUserId', userId, 365); // Set for 365 days, for example
    }

    // Only process data if it's not undefined
    const sortedAndGroupedNotifications = data ? (data.length > 0 ? sortAndGroupNotifications(data) : []) : null;

    const returnObj: SDKDataReturn = {
        data: sortedAndGroupedNotifications,
        isLoading: isLoading,
        isError: !!error,
        error,
    };
    //console.log(`Returning this object: ${JSON.stringify(returnObj,null,2)}`);
    return returnObj;
};

export const TinadSDK = {
    init,
    useSDKData,
};

    
