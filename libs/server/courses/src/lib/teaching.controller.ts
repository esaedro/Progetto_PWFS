import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ServerCoursesService } from './courses.service';
import { CreateTeachingDto } from './dto/create-teaching.dto';
import { UpdateTeachingDto } from './dto/update-teaching.dto';
import { Roles, JwtAuthGuard, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';

@ApiTags('Teachings APIs')
@Controller('teachings')
export class ServerTeachingController {
    constructor(private serverCoursesService: ServerCoursesService) { }

    //TODO: eventuali guardie

    @Get() // GET /teachings
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    getTeachings() {
        return this.serverCoursesService.getTeachings();
    }

    @Get('by-professor/:professorId') // GET /teachings/by-professor/:professorId
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    getTeachingsByProfessor(@Param('professorId', ParseIntPipe) professorId: number) {
        return this.serverCoursesService.getTeachingsByProfessor(professorId);
    }

    @Get('by-degree/:degreeId/year/:year') // GET /teachings/by-degree/:degreeId/year/:year
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    getTeachingsByDegreeAndYear(
        @Param('degreeId', ParseIntPipe) degreeId: number,
        @Param('year', ParseIntPipe) year: number
    ) {
        return this.serverCoursesService.getTeachingsByDegreeAndYear(degreeId, year);
    }

/*     @Get('details/:id') // GET /teachings/details/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    getTeachingDetails(@Param('id', ParseIntPipe) id: number) {
        return this.serverCoursesService.getTeachingDetails(id);
    } */

    @Get(':id') // GET /teachings/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    getTeachingById(@Param('id', ParseIntPipe) id: number) {
        return this.serverCoursesService.getTeachingByID(id);
    }

    @Post("create") // POST /teachings
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiBody({
        type: CreateTeachingDto,
        examples: {
            create: {
                value: {
                    year: 2,
                    subjectId: 10,
                    degreeId: 3,
                },
            },
        },
    })
    createTeaching(@Body(ValidationPipe) dto: CreateTeachingDto) {
        return this.serverCoursesService.createTeaching(dto);
    }

    @Patch('update/:id') // PATCH /teachings/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiBody({
        type: UpdateTeachingDto,
        examples: {
            update: {
                value: {
                    year: 3,
                    subjectId: 12,
                },
            },
        },
    })
    updateTeaching(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpdateTeachingDto) {
        return this.serverCoursesService.updateTeaching(id, dto);
    }

    @Delete('delete/:id') // DELETE /teachings/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    deleteTeaching(@Param('id', ParseIntPipe) id: number) {
        return this.serverCoursesService.deleteTeaching(id);
    }
}
