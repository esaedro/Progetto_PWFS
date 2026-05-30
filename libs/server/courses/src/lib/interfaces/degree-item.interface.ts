export interface DegreeItem {
    id: number;
    name: string;
    duration: number; // in years
    teachings: {
        id: number;
        subject: string;
        year: number;
    }[];   
}   