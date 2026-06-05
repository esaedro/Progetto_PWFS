export interface TeachingItem {
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
// exams? 
}