import { UserRole } from "@server/users";

export interface ProfessorListItem {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}