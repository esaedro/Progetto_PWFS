import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ServerCoursesService } from './courses.service';
import { CreateDegreeDto } from './dto/create-degree.dto';
import { UpgradeDegreeDto } from './dto/update-degree.dto';
import { Roles, JwtAuthGuard, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';

@ApiTags('Degrees APIs')
@Controller('degrees')
export class ServerDegreeController {
    constructor(private serverCoursesService: ServerCoursesService) { }

    @Get() // GET /degrees
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    getDegrees() {
        return this.serverCoursesService.getDegrees();
    }

    @Get(':id') // GET /degrees/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROFESSOR, UserRole.SECRETARY)
    @ApiBearerAuth()
    getDegreeById(@Param('id', ParseIntPipe) id: number) {
        return this.serverCoursesService.getDegreeByID(id);
    }

    @Post("create") // POST /degrees
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiBody({
        type: CreateDegreeDto,
        examples: {
            create: {
                value: {
                    name: 'Ingegneria Informatica',
                    durationYears: 3,
                },
            },
        },
    })
    createDegree(@Body(ValidationPipe) dto: CreateDegreeDto) {
        return this.serverCoursesService.createDegree(dto);
    }

    @Patch('update/:id') // PATCH /degrees/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiBody({
        type: UpgradeDegreeDto,
        examples: {
            update: {
                value: {
                    name: 'Ingegneria Informatica',
                    durationYears: 3,
                },
            },
        },
    })
    updateDegree(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpgradeDegreeDto) {
        return this.serverCoursesService.updateDegree(id, dto);
    }

    @Delete('delete/:id') // DELETE /degrees/:id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    deleteDegree(@Param('id', ParseIntPipe) id: number) {
        return this.serverCoursesService.deleteDegree(id);
    }
}
