import { IsBoolean, IsDateString, IsEnum, IsNumber, IsString } from "class-validator";
import { ExamType } from "./exam-type.enum";

export class CreateExamDto {

    @IsDateString()
    dateTimeStart: Date;

    @IsDateString()
    dateTimeEnd: Date;

    @IsString()
    room: string;

    @IsString()
    description: string;

    @IsBoolean()
    partial: boolean;

    @IsEnum(ExamType, { message: 'Tipologie valide di esame sono: ORALE, SCRITTO o VERBALIZZAZIONE' })
    type: ExamType;

    @IsNumber()
    teachingId: number;

    @IsNumber()
    professorId: number;

    @IsNumber()
    sessionId: number;
}
