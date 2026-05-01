import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Degree } from './degree.entity';
import { Subject } from './subject.entity';
import { Teaching } from './teaching.entity';
import { SubjectRepository } from './subject.repository';
import { DegreeRepository } from './degree.repository';
import { TeachingRepository } from './teaching.repository';


@Injectable()
export class ServerCoursesService {

    constructor(
        @InjectRepository(Subject)
        private readonly subjectRepository: SubjectRepository,

        @InjectRepository(Degree)
        private readonly degreeRepository: DegreeRepository,
        
        @InjectRepository(Teaching)
        private readonly teachingRepository: TeachingRepository
    ) {}


    async getDegrees(): Promise<Degree[]> {
        const degrees = await this.degreeRepository.findAll();
        if (!degrees || degrees.length === 0) throw new NotFoundException('Non sono stati trovati corsi di laurea');
        return degrees;
    }

    async getSubjects(): Promise<Subject[]> {
        const subjects = await this.subjectRepository.findAll();
        if (!subjects || subjects.length === 0) throw new NotFoundException('Non sono stati trovate materie');
        return subjects;
    }

    async getTeachings(): Promise<Teaching[]> {
        const teachings = await this.teachingRepository.findAll();
        if (!teachings || teachings.length === 0) throw new NotFoundException('Non sono stati trovati insegnamenti');
        return teachings;
    }

    async getOneDegree(degreeID: number): Promise<Degree> {
        const degree = await this.degreeRepository.findByID(degreeID);
        if (!degree) throw new NotFoundException(`Non è stato trovato il corso di laurea con id = ${degreeID}`);
        return degree;
    }

    async getOneSubject(subjectID: number): Promise<Subject> {
        const subject = await this.subjectRepository.findByID(subjectID);
        if (!subject) throw new NotFoundException(`Non è stata trovata la materia con id = ${subjectID}`);
        return subject;
    }

    async getOneTeaching(teachingID: number): Promise<Teaching> {
        const teaching = await this.teachingRepository.findByID(teachingID);
        if (!teaching) throw new NotFoundException(`Non è stato trovato l'insegnamento con id = ${teachingID}`);
        return teaching;
    }





}
