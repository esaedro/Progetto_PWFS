import { IsNotEmpty, IsString, MinLength, MaxLength} from "class-validator";


export class CreateDegreeDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(4, { message: 'Il nome del corso di laurea deve essere lungo almeno 4 caratteri' })
    @MaxLength(500)
    name: string;

}
