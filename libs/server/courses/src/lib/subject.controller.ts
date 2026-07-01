import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ServerCoursesService } from './courses.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Roles, JwtAuthGuard, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';

@ApiTags('Subjects APIs')
@Controller('subjects')
export class ServerSubjectController {
    constructor(private serverCoursesService: ServerCoursesService) { }

    @Get() // GET /subjects
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    getSubjects() {
        return this.serverCoursesService.getSubjects();
    }

    @Get(':id') // GET /subjects/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    getSubjectById(@Param('id', ParseIntPipe) id: number) {
        return this.serverCoursesService.getSubjectByID(id);
    }

    @Post("create") // POST /subjects
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiBody({
        type: CreateSubjectDto,
        examples: {
            create: {
                value: {
                    name: 'Basi di Dati',
                    professorIds: [1],
                },
            },
        },
    })
    createSubject(@Body(ValidationPipe) dto: CreateSubjectDto) {
        return this.serverCoursesService.createSubject(dto);
    }

    @Patch('update/:id') // PATCH /subjects/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiBody({
        type: UpdateSubjectDto,
        examples: {
            update: {
                value: {
                    name: 'Basi di Dati e Sistemi Informativi',
                    professorIds: [1, 2, 3],
                },
            },
        },
    })
    updateSubject(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpdateSubjectDto) {
        return this.serverCoursesService.upgradeSubject(id, dto);
    }

    @Delete('delete/:id') // DELETE /subjects/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    deleteSubject(@Param('id', ParseIntPipe) id: number) {
        return this.serverCoursesService.deleteSubject(id);
    }
}
