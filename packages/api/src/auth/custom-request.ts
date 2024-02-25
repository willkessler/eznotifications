import { Request } from 'express';
import { Organization } from '../EZNotification/entities/Organizations.entity';

// This interface lets us add riders onto a standard http request object, e.g. the
// organization connnected to an api key provided by the client SDK.
interface CustomRequest extends Request {
    organization?: Organization;
}

export default CustomRequest;

