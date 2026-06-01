import { UserRole } from "../dto/user-role.enum";

export interface UserListItem {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    
}