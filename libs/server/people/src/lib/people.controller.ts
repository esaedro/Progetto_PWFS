import { Controller } from '@nestjs/common';
import { ServerPeopleService } from './people.service';

@Controller('people')
export class ServerPeopleController {
  constructor(private serverPeopleService: ServerPeopleService) {}
}
