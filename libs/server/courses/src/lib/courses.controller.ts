import { Controller } from '@nestjs/common';
import { ServerCoursesService } from './courses.service';

@Controller('courses')
export class ServerCoursesController {
  constructor(private serverCoursesService: ServerCoursesService) {}

  //TODO


}
