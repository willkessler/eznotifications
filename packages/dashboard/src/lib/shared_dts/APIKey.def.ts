export type APIKeyType = 'development' | 'production';

export default interface APIKey {
    uuid: string;
    createdAt: Date;
    updatedAt?: Date;
    expiresAt?: Date;
    apiKey: string;
    apiKeyType: APIKeyType;
    isActive: boolean;
}
