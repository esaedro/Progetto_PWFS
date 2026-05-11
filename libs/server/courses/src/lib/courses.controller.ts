import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServerCoursesService } from './courses.service';

@ApiTags('Courses APIs')
@Controller('courses')
export class ServerCoursesController {
  constructor(private serverCoursesService: ServerCoursesService) {}

  // TODO: eventuali rotte di dominio trasversali (es. seeder)

/*   
Rotte seeder (solo dev)
  POST /courses/seed → crea degrees, subjects e teachings di default
  POST /courses/reset → svuota tabelle del dominio courses e rigenera dati
  POST /courses/seed/demo → set di dati demo per test UI
 */

/* Rotte trasversali (aggregazioni/operazioni multi-entità)

  GET /courses/overview → elenco corsi di laurea con numero di materie e insegnamenti
  GET /courses/teaching-details/:id → restituisce insegnamento + degree + subject (oggi è su teaching, potrebbe stare qui se lo vuoi “trasversale”)
  POST /courses/import → importa degrees/subjects/teachings da CSV
  POST /courses/assign-professors → assegna più professori a più materie in bulk
  GET /courses/degree/:id/plan → piano di studi completo (teaching + subject + professori) */

}
