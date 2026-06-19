import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/login.page';
import { LogoutPage } from '../features/auth/logout.page';
import { ProtectedRoute } from '../features/auth/protected-route';
import { AppLayout } from '../features/layouts/app-layout';
import { UpdatePasswordPage } from '../features/auth/update-password';
import { TeachingsPage } from '../features/teachings/teachings.page';
import { SubjectsPage } from '../features/subjects/subjects.page';
import { DegreesPage } from '../features/degrees/degrees.page';
import { CreateDegreePage } from '../features/degrees/create-degree.page';
import { EditDegreePage } from '../features/degrees/edit-degree.page';
import { CreateSubjectPage } from '../features/subjects/create-subject.page';
import { EditSubjectPage } from '../features/subjects/edit-subject.page';
/* import { CreateTeachingPage } from '../features/teachings/create-teaching.page';
import { EditTeachingPage } from '../features/teachings/edit-teaching.page'; */
import { SessionsPage } from '../features/sessions/sessions.page';
import { CreateSessionPage } from '../features/sessions/create-session.page';
import { EditSessionPage } from '../features/sessions/edit-session.page';
import { ExamsPage } from '../features/exams/exams.page';
import { CreateExamPage } from '../features/exams/create-exam.page';
import { EditExamPage } from '../features/exams/edit-exam.page';
import { ProfessorsPage } from '../features/professors/professors.page';
import { CreateProfessorPage } from '../features/professors/create-professors';
import { EditProfessorPage } from '../features/professors/edit-professors';
import { DegreeDetailPage } from '../features/degrees/degree-detail.page';
import { EditStudyPlanPage } from '../features/degrees/edit-study-plan.page';

export function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logout" element={<LogoutPage />} />

            <Route 
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }>
                
                <Route path='/changepassword' element={<UpdatePasswordPage />} />

                <Route path='/degrees' element={<DegreesPage />} />
                <Route path='/degrees/:id' element={<DegreeDetailPage />} />
                <Route path='/subjects' element={<SubjectsPage />} />
                <Route path='/sessions' element={<SessionsPage />} />
                <Route path='/exams' element={<ExamsPage />} />

            </Route>
            <Route 
                element={
                    <ProtectedRoute allowedRoles={['SECRETARY']}>
                        <AppLayout/>
                    </ProtectedRoute>}>

                <Route path='/sessions/new' element={<CreateSessionPage />} />
                <Route path='/sessions/:id/edit' element={<EditSessionPage />} />
            
                <Route path='/degrees/new' element={<CreateDegreePage />} />
                <Route path='/degrees/:id/edit' element={<EditDegreePage />} />                
                <Route path='/degrees/:id/study-plan' element={<EditStudyPlanPage />} />

                <Route path='/subjects/new' element={<CreateSubjectPage />} />
                <Route path='/subjects/:id/edit' element={<EditSubjectPage />} />

                <Route path='/teachings' element={<TeachingsPage />} />
                {/* <Route path='/teachings/new' element={<CreateTeachingPage />} />
                <Route path='/teachings/:id/edit' element={<EditTeachingPage />} /> */}

                <Route path='/professors' element={<ProfessorsPage />} />
                <Route path='/professors/new' element={<CreateProfessorPage />} /> 
                <Route path='/professors/:id/edit' element={<EditProfessorPage />} /> 

            </Route>

            <Route 
                element={
                    <ProtectedRoute allowedRoles={['PROFESSOR']}>
                        <AppLayout/>
                    </ProtectedRoute>}>
            
                <Route path='/exams/new' element={<CreateExamPage />} />
                <Route path='/exams/:id/edit' element={<EditExamPage />} />
            </Route>
            
        </Routes>
    );
}

export default App;
