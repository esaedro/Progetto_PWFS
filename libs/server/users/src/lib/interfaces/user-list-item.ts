enum UserRole {
    PROFESSOR = 'PROFESSOR',
    SECRETARY = 'SECRETARY'
}

export interface UserListItem {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}