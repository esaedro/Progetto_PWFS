import { UserRole } from "@server/users";

export interface ProfessorListItem {
    professor_id: number;
    name: string;
    email: string;
    role: UserRole;
}