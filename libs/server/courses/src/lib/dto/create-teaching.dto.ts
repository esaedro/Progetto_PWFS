import { IsInt, IsNotEmpty, Max, Min } from "class-validator";

export class CreateTeachingDto {

	@IsInt()
	@IsNotEmpty()
	@Min(1)
	@Max(5, { message: 'L\'anno di corso deve essere compreso tra 1 e 5' })
	year: number;

	@IsInt()
	@IsNotEmpty()
	subjectId: number;

	@IsInt()
	@IsNotEmpty()
	degreeId: number;

}