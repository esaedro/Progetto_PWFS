import { UserEntity } from "@server/users";

export interface ProfessorUserListItem {
    professor_id: number;
    user: UserEntity
}