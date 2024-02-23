import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../EZNotification/entities/ApiKeys.entity'; // Adjust this import based on your project structure

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
    constructor(
        @InjectRepository(ApiKey)
        private apiKeyRepository: Repository<ApiKey>,
    ) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const apiKey = this.extractApiKey(request);

        if (!apiKey) {
            throw new UnauthorizedException('API key is missing');
        }

        // Determine if this is a frontend or backend request
        if (this.isFrontendRequest(request)) {
            return this.validateFrontendApiKey(apiKey, request);
        } else {
            return this.validateBackendApiKey(apiKey);
        }
    }

    private extractApiKey(request: Request): string | null {
        const authHeader = request.headers.authorization;
        return authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    }

    private isFrontendRequest(request: Request): boolean {
        return 'referer' in request.headers;
    }

    private async validateFrontendApiKey(apiKey: string, request: Request): Promise<boolean> {
        const referer = new URL(request.headers.referer);
        const domain = referer.hostname;

        const apiKeyEntity = await this.apiKeyRepository.findOne({ where: { apiKey } });
        // Look up the api key's permitted domains via their common organization_uuid.
        // If the domain from the referrer header isn't among the permitted domains, reject.
        const apiKeyValue = apiKeyEntity.apiKey;
        const queryBuilder = this.apiKeyRepository
            .createQueryBuilder('api_key')
            .innerJoinAndSelect('api_key.organization', 'organization')
            .innerJoinAndSelect('organization.permittedDomains', 'permitted_domains')
            .where('api_key.apiKey = :apiKeyValue', { apiKeyValue })
            .select('permitted_domains.domain');

        const results = await queryBuilder.getMany();
        const domains = results.flatMap(result => result.organization.permittedDomains.map(pd => pd.domain));

        if (!apiKeyEntity || !apiKeyEntity.isActive || !domains.includes(domain)) {
            throw new UnauthorizedException('Invalid API key or domain');
        }

        return true;
    }

    private async validateBackendApiKey(apiKey: string): Promise<boolean> {
        // Here, you would query your database to find the API key and check if it's active
        const apiKeyEntity = await this.apiKeyRepository.findOne({ where: { apiKey, isActive: true } });
        if (!apiKeyEntity) {
            throw new UnauthorizedException('Invalid API key');
        }

        return true;
    }
}
