import { useQuery } from '@tanstack/react-query';

const useFetchData = (params) => {
    console.log('in useFetchData');
    return useQuery({
        queryKey: ['notifications', params],
        queryFn: async () => {
            console.log('Fetching from API...');
            const url = new URL('http://localhost:5000/notifications');
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
            
            // Fetch data from the API
            const response = await fetch(url, {
                headers: {
                    "Authorization" : "Bearer KB4seNru"
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const results = response.json();
            console.log(`Got these results from the api: ${JSON.stringify(results,null,2)}`);
            return results;
        },
        refetchInterval: 15000, // Polling interval
    });
};

export default useFetchData;
