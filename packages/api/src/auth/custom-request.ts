import { Request } from 'express';
import { Organization } from '../EZNotification/entities/Organizations.entity';

interface CustomRequest extends Request {
    organization?: Organization;
}

export default CustomRequest;

