import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { ServerCoursesService } from './courses.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@ApiTags('Subjects APIs')
@Controller('subjects')
export class ServerSubjectController {
	constructor(private serverCoursesService: ServerCoursesService) {}

    //TODO: eventuali guardie

	@Get() // GET /subjects
	getSubjects() {
		return this.serverCoursesService.getSubjects();
	}

	@Get('professor/:professorId') // GET /subjects/professor/:professorId
	getSubjectsByProfessor(@Param('professorId', ParseIntPipe) professorId: number) {
		return this.serverCoursesService.getSubjectsByProfessor(professorId);
	}

	@Get(':id') // GET /subjects/:id
	getSubjectById(@Param('id', ParseIntPipe) id: number) {
		return this.serverCoursesService.getSubjectByID(id);
	}

	@Post() // POST /subjects
	@ApiBody({ type: CreateSubjectDto })
	createSubject(@Body(ValidationPipe) dto: CreateSubjectDto) {
		return this.serverCoursesService.createSubject(dto);
	}

	@Patch(':id') // PATCH /subjects/:id
	@ApiBody({ type: UpdateSubjectDto })
	updateSubject(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpdateSubjectDto) {
		return this.serverCoursesService.upgradeSubject(id, dto);
	}

	@Delete(':id') // DELETE /subjects/:id
	deleteSubject(@Param('id', ParseIntPipe) id: number) {
		return this.serverCoursesService.deleteSubject(id);
	}
}
