import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { ServerCoursesService } from './courses.service';
import { CreateDegreeDto } from './dto/create-degree.dto';
import { UpgradeDegreeDto } from './dto/update-degree.dto';

@ApiTags('Degrees APIs')
@Controller('degrees')
export class ServerDegreeController {
	constructor(private serverCoursesService: ServerCoursesService) {}

    //TODO: eventuali guardie

	@Get() // GET /degrees
	getDegrees() {
		return this.serverCoursesService.getDegrees();
	}

	@Get(':id') // GET /degrees/:id
	getDegreeById(@Param('id', ParseIntPipe) id: number) {
		return this.serverCoursesService.getDegreeByID(id);
	}

	@Post() // POST /degrees
	@ApiBody({
		type: CreateDegreeDto,
		examples: {
			create: {
				value: {
					name: 'Informatica',
				},
			},
		},
	})
	createDegree(@Body(ValidationPipe) dto: CreateDegreeDto) {
		return this.serverCoursesService.createDegree(dto);
	}

	@Patch(':id') // PATCH /degrees/:id
	@ApiBody({
		type: UpgradeDegreeDto,
		examples: {
			update: {
				value: {
					name: 'Informatica e Ingegneria',
				},
			},
		},
	})
	updateDegree(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpgradeDegreeDto) {
		return this.serverCoursesService.updateDegree(id, dto);
	}

	@Delete(':id') // DELETE /degrees/:id
	deleteDegree(@Param('id', ParseIntPipe) id: number) {
		return this.serverCoursesService.deleteDegree(id);
	}
}
