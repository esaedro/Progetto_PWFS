import { IsNumber} from "class-validator";

export class CreatePeopleDto {
    
    @IsNumber()
    professor_id: number;

    @IsNumber()
    exams : number;

    @IsNumber()
    subjects: number;
}
