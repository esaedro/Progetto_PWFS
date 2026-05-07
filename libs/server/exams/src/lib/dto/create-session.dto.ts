import { IsDateString } from "class-validator";

export class CreateSessionDto {

    @IsDateString()
    dateStartInsertion: Date;

    @IsDateString()
    dateEndInsertion: Date;

    @IsDateString()
    dateStartExamination: Date;

    @IsDateString()
    dateEndExamination: Date;

}
