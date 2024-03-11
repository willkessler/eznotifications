import useSWR from 'swr';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { SDKConfig, SDKNotification, SDKDataReturn } from './types';
export { SDKNotification, SDKDataReturn } from './types';

import { initTinadSDK, getTinadSDKConfig } from './config';
export { initTinadSDK, getTinadSDKConfig };

export const useSDKData = (pageId?: string) => {
    console.log('TINAD: useSDKData');
    const sdkConfig = getTinadSDKConfig();
    if (!sdkConfig) {
        throw new Error("Be sure to initialized TinadSDK with an API key before use.");
    }
    const apiKey = sdkConfig.apiKey;

    console.log('useSDKData: here is the sdkConfig:', sdkConfig);
    const apiBaseUrl = 'http://localhost:8080'; // this needs to come from environment
    const apiUrl = new URL(apiBaseUrl + '/notifications');

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

    const fetcher = async (url: string) => {
        const response = await fetch(apiUrl, {
            headers: {
                "Authorization": "Bearer " + apiKey,
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        try {
            const data = await response.json();
        } catch(error) {
            console.log(`Couldn't get json response, error: ${error}`);
        }
        // Process data as before
        if (data) {
            return data.map((notification: any) => ({
                ...notification,
                createdAt: new Date(notification.createdAt),
                startDate: notification.startDate ? new Date(notification.startDate) : undefined,
                endDate: notification.endDate ? new Date(notification.endDate) : undefined,
            }));
        }
        return [];
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
    // Main code for SDK starts here.
    //

    let userId = sdkConfig.userId || getCookie('sdkUserId');
    let userIdWasProvided = true;
    if (!userId) {
        userId = generateUniqueId();
        console.log(`Generated user id ${userId}`);
        userIdWasProvided = false;
    }
    apiUrl.searchParams.append('userId', userId);
    if (pageId) {
        apiUrl.searchParams.append('pageId', pageId as string);
    }
    if (sdkConfig.environment) {
        apiUrl.searchParams.append('environment', sdkConfig.environment as string);
    }

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
