import { CreateUserDto } from "@server/users";
import { IsNumber, IsArray, IsOptional} from "class-validator";

export class CreatePeopleDto extends CreateUserDto{
    
    @IsOptional()
    @IsNumber({}, { each: true })
    @IsArray()
    readonly exams?: number[];

    @IsOptional()
    @IsNumber({}, { each: true })
    @IsArray()
    readonly subjects?: number[];
}
