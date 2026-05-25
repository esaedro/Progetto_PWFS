import { IsBoolean, IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { ExamType } from "./exam-type.enum";
import { Type } from "class-transformer";

export class CreateExamDto {

    @Type(() => Date)
    @IsDate()
    dateTimeStart: Date;

    @Type(() => Date)
    @IsDate()
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
