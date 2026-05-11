import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { ServerCoursesService } from './courses.service';
import { CreateTeachingDto } from './dto/create-teaching.dto';
import { UpdateTeachingDto } from './dto/update-teaching-dto';

@ApiTags('Teachings APIs')
@Controller('teachings')
export class ServerTeachingController {
	constructor(private serverCoursesService: ServerCoursesService) {}

    //TODO: eventuali guardie

	@Get() // GET /teachings
	getTeachings() {
		return this.serverCoursesService.getTeachings();
	}

	@Get('degree/:degreeId/year/:year') // GET /teachings/degree/:degreeId/year/:year
	getTeachingsByDegreeAndYear(
		@Param('degreeId', ParseIntPipe) degreeId: number,
		@Param('year', ParseIntPipe) year: number
	) {
		return this.serverCoursesService.getTeachingsByDegreeAndYear(degreeId, year);
	}

	@Get(':id/details') // GET /teachings/:id/details
	getTeachingDetails(@Param('id', ParseIntPipe) id: number) {
		return this.serverCoursesService.getTeachingDetails(id);
	}

	@Get('professor/:professorId') // GET /teachings/professor/:professorId
	getTeachingsByProfessor(@Param('professorId', ParseIntPipe) professorId: number) {
		return this.serverCoursesService.getTeachingsByProfessor(professorId);
	}

	@Get(':id') // GET /teachings/:id
	getTeachingById(@Param('id', ParseIntPipe) id: number) {
		return this.serverCoursesService.getTeachingByID(id);
	}

	@Post() // POST /teachings
	@ApiBody({ type: CreateTeachingDto })
	createTeaching(@Body(ValidationPipe) dto: CreateTeachingDto) {
		return this.serverCoursesService.createTeaching(dto);
	}

	@Patch(':id') // PATCH /teachings/:id
	@ApiBody({ type: UpdateTeachingDto })
	updateTeaching(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpdateTeachingDto) {
		return this.serverCoursesService.updateTeaching(id, dto);
	}

	@Delete(':id') // DELETE /teachings/:id
	deleteTeaching(@Param('id', ParseIntPipe) id: number) {
		return this.serverCoursesService.deleteTeaching(id);
	}
}
