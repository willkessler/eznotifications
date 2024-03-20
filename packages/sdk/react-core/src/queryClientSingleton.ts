import { QueryClient } from '@tanstack/react-query';

let sdkQueryClient: QueryClient | undefined;

export const getSdkQueryClient = (): QueryClient => {
  if (!sdkQueryClient) {
    sdkQueryClient = new QueryClient();
  }
  return sdkQueryClient;
};
