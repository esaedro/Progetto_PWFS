import { useState } from 'react';
import { createExam } from './exams.api';

export function CreateExamPage() {
    const [examData, setExamData] = useState({
        name: '',
        date: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExamData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createExam(examData);
            // Reset form or show success message
        } catch (err) {
            // Show error message
        }
    };

    return (
        <div>
            <h1>Create Exam</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={examData.name}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="date">Date:</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={examData.date}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit">Create Exam</button>
            </form>
        </div>
    );
}
