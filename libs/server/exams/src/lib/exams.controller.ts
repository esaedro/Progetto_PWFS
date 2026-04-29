import { Controller } from '@nestjs/common';
import { ServerExamsService } from './exams.service';

@Controller('exams')
export class ServerExamsController {
  constructor(private serverExamsService: ServerExamsService) {}
}
