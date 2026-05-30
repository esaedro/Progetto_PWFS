import { IsInt, IsNotEmpty, Min } from "class-validator";

export class CreateTeachingDto {

	@IsInt()
	@IsNotEmpty()
	@Min(1)
	year: number;

	@IsInt()
	@IsNotEmpty()
	subjectId: number;

	@IsInt()
	@IsNotEmpty()
	degreeId: number;

}