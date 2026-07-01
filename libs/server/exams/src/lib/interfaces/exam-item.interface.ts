export interface ExamItem {
    id: number;
    dateTimeStart: Date;
    dateTimeEnd: Date;
    description?: string;
    partial: boolean;
    type: 'ORALE' | 'SCRITTO' | 'VERBALIZZAZIONE';
    teaching: {
        id: number;
        subject: {
            id: number;
            name: string;
        };
        degree: {
            id: number;
            name: string;
        };
        year: number;
    };
    professor?: {
        professor_id: number;
        user: {
            name: string;
            email?: string;
        };
    };
    subjectProfessors?: {
        professor_id: number;
        user?: {
            name: string;
        };
    }[];
}
