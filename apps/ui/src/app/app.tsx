import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/login.page';
import { LogoutPage } from '../features/auth/logout.page';
import { ProtectedRoute } from '../features/auth/protected-route';
import { AppLayout } from '../features/layouts/app-layout';
import { HomePage } from '../features/home/home.page';
import { UpdatePasswordPage } from '../features/auth/update-password';

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
      </Route>
      
      

      {/* <Route path="/home-module" element={<HomeModulePage />} />
      <Route path="/home-tailwind" element={<HomeTailwindPage />} />
      <Route path="/home-bootstrap" element={<HomeBootstrapPage />} /> */}
    </Routes>
  );
}

export default App;

