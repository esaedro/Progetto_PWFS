import { CreateUserDto } from "@server/users";
import { IsNumber, IsArray, IsOptional} from "class-validator";

export class CreatePeopleDto extends CreateUserDto{

    readonly user: CreateUserDto;
    
    @IsOptional()
    @IsNumber()
    readonly professor_id: number;

    @IsOptional()
    @IsNumber({}, { each: true })
    @IsArray()
    readonly exams?: number[];

    @IsOptional()
    @IsNumber({}, { each: true })
    @IsArray()
    readonly subjects?: number[];
}
