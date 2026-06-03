// eslint-disable-next-line @nx/enforce-module-boundaries
import { ProfessorListItem } from "@server/people";

export interface SubjectItem {
    id: number;
    name: string;
    professors: ProfessorListItem[];
    teachings: {
        id: number;
        degree: string;
        year: number;
    }[];
}