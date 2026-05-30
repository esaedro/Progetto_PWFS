export interface SubjectItem {
    id: number;
    name: string;
    professors: {
        id: number;
        name: string;
    }[];
    teachings: {
        id: number;
        degree: string;
        year: number;
    }[];
}