import { CreateExamDto } from "./create-exam.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateExamDto extends PartialType(CreateExamDto) {

}
