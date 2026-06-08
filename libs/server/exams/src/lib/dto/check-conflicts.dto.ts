import { IsDate, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CheckConflictsDto {

    @Type(() => Date)
    @IsDate()
    dateTimeStart: Date;

    @Type(() => Date)
    @IsDate()
    dateTimeEnd: Date;

    @IsNumber()
    teachingId: number;

    @IsNumber()
    sessionId: number;

    @IsNumber()
    @IsOptional()
    examId?: number;
}
