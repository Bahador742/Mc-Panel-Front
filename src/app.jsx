import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Console from "./componenets/console";
import Editor from "./componenets/editor";
import Filemanager from "./pages/filemanager";
import UserManager from "./pages/usermanager";
import NotFound from "./pages/notfound";



import baseURL from "./contexts/baseURL";


axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


const PrivateRoute = ({ component: Component }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const { exp } = jwtDecode(token);
    if (Date.now() >= exp * 1000) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
    return <Component />;
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

const App = () => {
  const [filename, setFilename] = useState(null);
  const [BaseURL] = useState("http://87.248.156.231:5834");
  const [DownloadP , setDownloadP] = useState('')
  
  const contextValue = {
    filename,
    setFilename,
    BaseURL,
    DownloadP,
    setDownloadP,
  };

  return (
    <baseURL.Provider value={contextValue}>
      <BrowserRouter basename="/">
        <Routes>
          <Route index element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/files" element={<PrivateRoute component={Filemanager} />} />
          <Route path="/console" element={<PrivateRoute component={Console} />} />
          <Route path="/editor" element={<PrivateRoute component={Editor} />} />
          <Route path="/users" element={<PrivateRoute component={UserManager} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </baseURL.Provider>
  );
};

export default App; 