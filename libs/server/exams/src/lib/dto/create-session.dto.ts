import { Type } from "class-transformer";
import { IsArray, IsDate, IsOptional, IsString } from "class-validator";

export class CreateSessionDto {

    @Type(() => Date)
    @IsDate()
    dateStartInsertion: Date;

    @Type(() => Date)
    @IsDate()
    dateEndInsertion: Date;

    @Type(() => Date)
    @IsDate()
    dateStartExamination: Date;

    @Type(() => Date)
    @IsDate()
    dateEndExamination: Date;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    holidays?: string[];

}
