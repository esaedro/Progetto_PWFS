import { useState } from 'react';
import { updateExam } from './exams.api';

export function EditExamPage({ exam }) {
    const [examData, setExamData] = useState({
        name: exam.name,
        date: exam.date
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
            await updateExam(exam.id, examData);
            // Show success message or redirect
        } catch (err) {
            // Show error message
        }
    };

    return (
        <div>
            <h1>Edit Exam</h1>
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
                <button type="submit">Update Exam</button>
            </form>
        </div>
    );
}
