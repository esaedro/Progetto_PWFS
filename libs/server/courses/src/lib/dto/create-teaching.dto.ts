import { IsInt, IsNotEmpty, Max, Min } from "class-validator";

export class CreateTeachingDto {

	@IsInt()
	@IsNotEmpty()
	@Min(1)
	@Max(5)
	year: number;

	@IsInt()
	@IsNotEmpty()
	subjectId: number;

	@IsInt()
	@IsNotEmpty()
	degreeId: number;

}