import { Injectable, Inject, forwardRef, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Degree } from './degree.entity';
import { Subject } from './subject.entity';
import { Teaching } from './teaching.entity';
import { SubjectRepository } from './subject.repository';
import { DegreeRepository } from './degree.repository';
import { TeachingRepository } from './teaching.repository';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreateDegreeDto } from './dto/create-degree.dto';
import { UpgradeDegreeDto } from './dto/update-degree.dto';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ServerPeopleService, Professor } from '@server/people';
import { CreateTeachingDto } from './dto/create-teaching.dto';
import { UpdateTeachingDto } from './dto/update-teaching-dto';



@Injectable()
export class ServerCoursesService {

    constructor(
        private readonly subjectRepository: SubjectRepository,
        private readonly degreeRepository: DegreeRepository,
        private readonly teachingRepository: TeachingRepository,

            @Inject(forwardRef(() => ServerPeopleService))
        private readonly peopleService: ServerPeopleService,
    ) {}


    async getDegrees(): Promise<Degree[]> {
        const degrees = await this.degreeRepository.findAll();
        if (!degrees || degrees.length === 0) 
            throw new NotFoundException('Non sono stati trovati corsi di laurea');
        return degrees;
    }

    async getSubjects(): Promise<Subject[]> {
        const subjects = await this.subjectRepository.findAll();
        if (!subjects || subjects.length === 0) 
            throw new NotFoundException('Non sono state trovate materie');
        return subjects;
    }

    async getTeachings(): Promise<Teaching[]> {
        const teachings = await this.teachingRepository.findAll();
        if (!teachings || teachings.length === 0) 
            throw new NotFoundException('Non sono stati trovati insegnamenti');
        return teachings;
    }

    async getDegreeByID(degreeID: number): Promise<Degree> {
        const degree = await this.degreeRepository.findByID(degreeID);
        if (!degree) 
            throw new NotFoundException(`Non è stato trovato il corso di laurea con id = ${degreeID}`);
        return degree;
    }

    async getSubjectByID(subjectID: number): Promise<Subject> {
        const subject = await this.subjectRepository.findByID(subjectID);
        if (!subject) 
            throw new NotFoundException(`Non è stata trovata la materia con id = ${subjectID}`);
        return subject;
    }

    async getTeachingByID(teachingID: number): Promise<Teaching> {
        const teaching = await this.teachingRepository.findByID(teachingID);
        if (!teaching) 
            throw new NotFoundException(`Non è stato trovato l'insegnamento con id = ${teachingID}`);
        return teaching;
    }

    async getTeachingsByDegreeAndYear(degreeId: number, year: number): Promise<Teaching[]> {
        const teachings = await this.teachingRepository.findByDegreeAndYear(degreeId, year);
        if (!teachings || teachings.length === 0) 
            throw new NotFoundException(`Non sono stati trovati insegnamenti per il corso di laurea con id = ${degreeId} e anno = ${year}`);
        return teachings;
    }
    
    async getTeachingDetails(teachingId: number): Promise<{ degree: Degree; subject: Subject; year: number }> {
        const teaching = await this.teachingRepository.findByID(teachingId);
        if (!teaching) 
            throw new NotFoundException(`Non è stato trovato l'insegnamento con id = ${teachingId}`);
        
        const degree = teaching.degree 
        const subject = teaching.subject;
        const year = teaching.year;
        
        return { degree, subject, year };

        // TODO? caricare anche i professori che insegnano la materia?
    }
    
    async getSubjectsByProfessor(professorId: number): Promise<Subject[]> {
        await this.peopleService.findById(professorId);
        const subjects = await this.subjectRepository.findSubjectsByProfessor(professorId);
        if (!subjects || subjects.length === 0)
            throw new NotFoundException(`Non sono state trovati insegnamenti per il professore con id = ${professorId}`);
        return subjects;
    }

    //da usare se il docente deve scegliere tra i propri insegnamenti
    async getTeachingsByProfessor(professorId: number): Promise<Teaching[]> {
        const subjects = this.getSubjectsByProfessor(professorId);
        const teachings: Teaching[] = [];
        for (const subject of await subjects) {
            const subjectTeachings = await this.teachingRepository.findTeachingsBySubject(subject.id);
            teachings.push(...subjectTeachings);
        }
        if (teachings.length === 0)
            throw new NotFoundException(`Non sono stati trovati insegnamenti per il professore con id = ${professorId}`);
        return teachings;
    }

    async createSubject(dto: CreateSubjectDto): Promise<Subject> {
        const professors = await this.peopleService.getProfessorsByIds(dto.professorIds);

        return this.subjectRepository.createSubject(dto, professors);
    }

    async upgradeSubject(id: number, dto: UpdateSubjectDto): Promise<Subject> {
        const subject = await this.subjectRepository.findByID(id);
        if (!subject) 
            throw new NotFoundException(`Non è stata trovata la materia con id = ${id}`);

        let professors: Professor[] | undefined;

        if (dto.professorIds !== undefined) {
            professors = await this.peopleService.getProfessorsByIds(dto.professorIds);
        }

        const result = await this.subjectRepository.upgradeSubject(id, dto, professors);
        if (!result)
            throw new NotFoundException(`Non è stata trovata la materia con id = ${id}`);
        return result;
    }

    async deleteSubject(id: number): Promise<void> {
        const deleted = await this.subjectRepository.deleteSubject(id);
        if (!deleted) 
            throw new NotFoundException(`Non è stata trovata la materia con id = ${id}`);
    }

    async createDegree(dto: CreateDegreeDto): Promise<Degree> {
        return this.degreeRepository.createDegree(dto);
    }

    async updateDegree(id: number, dto: UpgradeDegreeDto): Promise<Degree> {
        const degree = await this.degreeRepository.findByID(id);
        if (!degree) 
            throw new NotFoundException(`Non è stato trovato il corso di laurea con id = ${id}`);

        const result = await this.degreeRepository.updateDegree(id, dto);
        if (!result)
            throw new NotFoundException(`Non è stato trovato il corso di laurea con id = ${id}`);
        return result;
    }

    async deleteDegree(id: number): Promise<void> {
        const deleted = await this.degreeRepository.deleteDegree(id);
        if (!deleted) 
            throw new NotFoundException(`Non è stato trovato il corso di laurea con id = ${id}`);
    }

    async createTeaching(dto: CreateTeachingDto): Promise<Teaching> {
        const degree = await this.degreeRepository.findByID(dto.degreeId);
        const subject = await this.subjectRepository.findByID(dto.subjectId);
        if (!degree)
            throw new NotFoundException(`Non è stato trovato il corso di laurea con id = ${dto.degreeId}`);
        if (!subject)
            throw new NotFoundException(`Non è stata trovata la materia con id = ${dto.subjectId}`);

        if (dto.year > degree.durationYears)
            throw new BadRequestException(
                `L'anno di corso deve essere compreso tra 1 e ${degree.durationYears}`
            );

        const duplicate = await this.teachingRepository.findByDegreeSubjectYear(
            dto.degreeId,
            dto.subjectId,
            dto.year
        );
        if (duplicate)
            throw new ConflictException('Esiste gia\' un insegnamento con lo stesso corso, materia e anno');
        
        return this.teachingRepository.createTeaching(dto);
    }

    async updateTeaching(id: number, dto: UpdateTeachingDto): Promise<Teaching> {
        const teaching = await this.teachingRepository.findByID(id);
        if (!teaching) 
            throw new NotFoundException(`Non è stato trovato l'insegnamento con id = ${id}`);

        let subject: Subject | undefined;
        let degree: Degree | undefined;

        if (dto.subjectId !== undefined) {
            const foundSubject = await this.subjectRepository.findByID(dto.subjectId);
            if (!foundSubject)
                throw new NotFoundException(`Non è stata trovata la materia con id = ${dto.subjectId}`);
            subject = foundSubject;
        }

        if (dto.degreeId !== undefined) {
            const foundDegree = await this.degreeRepository.findByID(dto.degreeId);
            if (!foundDegree)
                throw new NotFoundException(`Non è stato trovato il corso di laurea con id = ${dto.degreeId}`);
            degree = foundDegree;
        }

        const targetDegree = degree ?? teaching.degree;
        const targetYear = dto.year ?? teaching.year;
        if (targetYear > targetDegree.durationYears)
            throw new BadRequestException(
                `L'anno di corso deve essere compreso tra 1 e ${targetDegree.durationYears}`
            );

        const targetDegreeId = dto.degreeId ?? teaching.degree.id;
        const targetSubjectId = dto.subjectId ?? teaching.subject.id;
        const duplicate = await this.teachingRepository.findByDegreeSubjectYear(
            targetDegreeId,
            targetSubjectId,
            targetYear
        );
        if (duplicate && duplicate.id !== id)
            throw new ConflictException('Esiste gia\' un insegnamento con lo stesso corso, materia e anno');

        const result = await this.teachingRepository.updateTeaching(id, dto, subject, degree);
        if (!result)
            throw new NotFoundException(`Non è stato trovato l'insegnamento con id = ${id}`);
        return result;
    }

    async deleteTeaching(id: number): Promise<void> {
        const deleted = await this.teachingRepository.deleteTeaching(id);
        if (!deleted) 
            throw new NotFoundException(`Non è stato trovato l'insegnamento con id = ${id}`);
    }

}
