export interface ExamItem {
    id: number;
    dateTimeStart: Date;
    dateTimeEnd: Date;
    room?: string;
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
}
