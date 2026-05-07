import { PartialType } from "@nestjs/swagger";
import { CreateTeachingDto } from "./create-teaching.dto";

export class UpdateTeachingDto extends PartialType(CreateTeachingDto) {}