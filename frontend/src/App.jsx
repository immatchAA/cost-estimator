import {BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login/LoginPage'
import Register from './components/Register/RegisterPage';
import MaterialSearch from './components/MaterialSearch/MaterialSearch';
import UploadFile from './components/CostEstimates/UploadFile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/login" element={<Login />} /> 
        <Route path ="/register" element={<Register /> }/>
        <Route path ="/materialsearch" element={<MaterialSearch /> }/>
        <Route path ="/uploadfile" element={<UploadFile /> }/>
      </Routes>
    </BrowserRouter>
  
  )
}
 


export default App;
