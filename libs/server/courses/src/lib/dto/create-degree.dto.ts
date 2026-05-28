import { IsNotEmpty, IsString, MinLength, MaxLength, IsInt, Min, Max } from "class-validator";


export class CreateDegreeDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(4, { message: 'Il nome del corso di laurea deve essere lungo almeno 4 caratteri' })
    @MaxLength(500)
    name: string;

    @IsInt({ message: 'La durata del corso deve essere un numero intero' })
    @IsNotEmpty()
    @Min(1, { message: 'La durata del corso deve essere almeno 1 anno' })
    @Max(5, { message: 'La durata del corso non puo\' superare 5 anni' })
    durationYears: number;

}
