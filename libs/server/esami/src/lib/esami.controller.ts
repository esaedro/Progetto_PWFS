import { Controller } from '@nestjs/common';
import { ServerEsamiService } from './esami.service';

@Controller('esami')
export class ServerEsamiController {
  constructor(private serverEsamiService: ServerEsamiService) {}
}
