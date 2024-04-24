import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../EZNotification/entities/ApiKeys.entity'; // Adjust this import based on your project structure
import CustomRequest from './custom-request';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
    constructor(
        @InjectRepository(ApiKey)
        private apiKeyRepository: Repository<ApiKey>,
    ) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<CustomRequest>();
        const apiKey = this.extractApiKey(request);

        if (!apiKey) {
            throw new UnauthorizedException('API key is missing');
        }

        // Determine if this is a frontend or backend request
        if (this.isFrontendRequest(request)) {
            return this.validateFrontendApiKey(apiKey, request);
        } else {
            return this.validateBackendApiKey(apiKey, request);
        }
    }

    private extractApiKey(request: CustomRequest): string | null {
        const authHeader = request.headers.authorization;
        return authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    }

    private isFrontendRequest(request: CustomRequest): boolean {
        return 'referer' in request.headers;
    }

    // Function to check if a domain matches any of the allowed patterns
    private isDomainAuthorized(apiKeyEntity: ApiKey, allowedDomains: string[], currentDomain: string): boolean {
      if (apiKeyEntity.expiresAt !== null) {
        // temporary API key. if the inbound domain is still current, proceed.
        console.log(`Checking temporary key with expiresAt: ${apiKeyEntity.expiresAt}`);
        const rightNow = new Date().getTime();
        const dateCheck = new Date(apiKeyEntity.expiresAt).getTime();
        if (dateCheck < rightNow) {
          console.log('Key seems to be expired');
          return false; // this temporary key has expired, do not honor
        }
        // if the temporary key ends in stackblitz.com, proceed.
        const isStackBlitz = currentDomain.endsWith('stackblitz.com');
        console.log(`isStackblitz? : ${isStackblitz}`);
        return isStackBlitz;
      }

      console.log(`Proceeding to check against domains list ${JSON.stringify(allowedDomains)}`);

      return allowedDomains.some(allowedDomain => {
        if (allowedDomain.startsWith('*.')) {
          const baseDomain = allowedDomain.slice(2); // Remove '*.' to get the base domain
          return currentDomain.endsWith(baseDomain);
        } else {
          return allowedDomain === currentDomain;
        }
      });
    }

    private async validateFrontendApiKey(apiKey: string, request: CustomRequest): Promise<boolean> {
        const referer = new URL(request.headers.referer);
        const domain = referer.hostname;
        console.log(`validator referer domain:${domain}`);

        const apiKeyEntity = await this.apiKeyRepository.findOne({ 
            where: { 
                apiKey 
            },
            relations: {
                organization: true,
            },
        });
        // Look up the api key's permitted domains via their common organization_uuid.
        // If the domain from the referrer header isn't among the permitted domains, reject.
      console.log(`We got this apiKey uuid: ${apiKeyEntity.uuid}.`);
        const apiKeyValue = apiKeyEntity.apiKey;
        const queryBuilder = this.apiKeyRepository
            .createQueryBuilder('api_key')
            .innerJoinAndSelect('api_key.organization', 'organization')
            .innerJoinAndSelect('organization.permittedDomains', 'permitted_domains')
            .where('api_key.apiKey = :apiKeyValue', { apiKeyValue })
            .select('permitted_domains.domain as domain');

        //const results = await queryBuilder.getMany(); // not sure why a regular getMany() didn't work here?
        //const domains = results.flatMap(result => result.organization.permittedDomains.map(pd => pd.domain));
        const results = await queryBuilder.getRawMany();
        //console.log('We got these results from getRawMany:', JSON.stringify(results));
        const domains = results.map(result => result.domain);

        console.log(process.env.NODE_ENV);
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'development' && process.env.DOMAIN_OVERRIDE) {
            domains.push(process.env.DOMAIN_OVERRIDE);
        }

        console.log(`validateFrontendApiKey, domains: ${domains}, seeking domain: ${domain}`);

        if (!apiKeyEntity || !apiKeyEntity.isActive || !this.isDomainAuthorized(apiKeyEntity, domains, domain)) {
            throw new UnauthorizedException('Invalid API key or domain');
        }

        // Add the Organization to the request so we can use it down the line in the controllers.
        request.organization = apiKeyEntity.organization;
        console.log(`In validator, organization= ${JSON.stringify(request.organization)}`);
        return true;
    }

    private async validateBackendApiKey(apiKey: string, request: CustomRequest): Promise<boolean> {
        const apiKeyEntity = await this.apiKeyRepository.findOne({ 
          where: { apiKey, isActive: true },
          relations: ['organization'],
        });
        if (!apiKeyEntity) {
            throw new UnauthorizedException('Unknown API key');
        }
        console.log(`Found valid api key:${apiKeyEntity.apiKey}`);
        // Now attach the org to the request so the API can use it later
        request.organization = apiKeyEntity.organization;

        return true;
    }

    public async isApiKeyDevelopment(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<CustomRequest>();
        const apiKey = this.extractApiKey(request);

        if (!apiKey) {
            throw new UnauthorizedException('API key is missing');
        }

        const apiKeyEntity = await this.apiKeyRepository.findOne({ where: { apiKey, isActive: true } });
        if (!apiKeyEntity) {
            throw new UnauthorizedException('Unknown API key');
        }

        return (apiKeyEntity.apiKeyType === 'development');

    }
}
