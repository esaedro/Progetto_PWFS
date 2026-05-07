import { IsString, IsNotEmpty, MinLength, MaxLength, IsInt, IsArray, ArrayMinSize } from "class-validator";


export class CreateSubjectDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(4, { message: 'Il nome della materia deve essere lungo almeno 4 caratteri' })
    @MaxLength(255)
    name: string;
    
    @IsArray()
    @ArrayMinSize(1, { message: 'Almeno un professore è richiesto' })
    @IsInt({ each: true, message: 'Tutti gli id devono essere numeri interi' })
    professorIds: number[];

}