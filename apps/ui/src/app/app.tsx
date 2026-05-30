import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/login.page';
import { LogoutPage } from '../features/auth/logout.page';
import { ProtectedRoute } from '../features/auth/protected-route';
import { AppLayout } from '../features/layouts/app-layout';
import { HomePage } from '../features/home/home.page';
import { UpdatePasswordPage } from '../features/auth/update-password';
import { TeachingsPage } from '../features/teachings/teachings.page';
import { SubjectsPage } from '../features/subjects/subjects.page';
import { DegreesPage } from '../features/degrees/degrees.page';
import { CreateDegreePage } from '../features/degrees/create-degree.page';
import { EditDegreePage } from '../features/degrees/edit-degree.page';
import { CreateSubjectPage } from '../features/subjects/create-subject.page';
import { EditSubjectPage } from '../features/subjects/edit-subject.page';
import { CreateTeachingPage } from '../features/teachings/create-teaching.page';
import { EditTeachingPage } from '../features/teachings/edit-teaching.page';

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
          </ProtectedRoute>}>
        <Route path='/home' element={<HomePage/>}/>
        <Route path='/changepassword' element={<UpdatePasswordPage/>}/>

        <Route path='/degrees' element={<DegreesPage/>}/>
        <Route path='/degrees/new' element={<CreateDegreePage/>}/>
        <Route path='/degrees/:id/edit' element={<EditDegreePage/>}/>

        <Route path='/subjects' element={<SubjectsPage/>}/>
        <Route path='/subjects/new' element={<CreateSubjectPage/>}/>
        <Route path='/subjects/:id/edit' element={<EditSubjectPage/>}/>
        
        <Route path='/teachings' element={<TeachingsPage/>}/>
        <Route path='/teachings/new' element={<CreateTeachingPage/>}/>
        <Route path='/teachings/:id/edit' element={<EditTeachingPage/>}/>

      </Route>
      
      

      {/* <Route path="/home-module" element={<HomeModulePage />} />
      <Route path="/home-tailwind" element={<HomeTailwindPage />} />
      <Route path="/home-bootstrap" element={<HomeBootstrapPage />} /> */}
    </Routes>
  );
}

export default App;

