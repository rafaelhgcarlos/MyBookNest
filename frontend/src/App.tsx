import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./pages/Home.tsx";
import Library from "./pages/Library.tsx";
import NotFound from "./pages/NotFound.tsx";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login.tsx";
import BookDetails from "./pages/BookDetails.tsx";
import Profile from "./pages/Profile.tsx";
import EditProfile from "./pages/EditProfile.tsx";
import {AuthProvider} from "./context/AuthContext";
import {Toaster} from "react-hot-toast";

export default function App() {

    return (
        <AuthProvider>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: "#1e3a8a",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "12px 16px",
                    },
                    success: { iconTheme: { primary: "#3b82f6", secondary: "#fff" } },
                    error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
                }}
            />
            <Router>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/biblioteca" element={<Library/>}/>
                    <Route path="/biblioteca/:id" element={<BookDetails/>}/>
                    <Route path="/registrar" element={<Register/>}/>
                    <Route path="/entrar" element={<Login/>}/>
                    <Route path="/perfil" element={<Profile/>}/>
                    <Route path="/editar-perfil" element={<EditProfile/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </Router>
        </AuthProvider>
    )
}
