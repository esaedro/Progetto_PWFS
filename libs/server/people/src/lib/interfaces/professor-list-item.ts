import { UserEntity } from "@server/users";

export interface ProfessorListItem {
    professor_id: number;
    user: UserEntity;
}