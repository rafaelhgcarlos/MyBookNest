import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home.tsx";
import Library from "./pages/Library.tsx";
import NotFound from "./pages/NotFound.tsx";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login.tsx";
import BookDetails from "./pages/BookDetails.tsx";
import Profile from "./pages/Profile.tsx";
import EditProfile from "./pages/EditProfile.tsx";
import About from "./pages/About.tsx";
import Footer from "./components/Home/Footer";
import ResetPassword from "./pages/ResetPassword.tsx";
import CreateCollection from "./pages/CreateCollection.tsx";
import { AuthProvider } from "./context/AuthContext";
import { Toaster, toast } from "react-hot-toast";

function ToastCleanup() {
    const location = useLocation();

    useEffect(() => {
        toast.dismiss();
    }, [location]);

    return null;
}

function Layout() {
    const location = useLocation();
    const hideFooterRoutes = ["/registrar", "/entrar", "/resetar-senha"];

    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/biblioteca" element={<Library />} />
                <Route path="/biblioteca/:id" element={<BookDetails />} />
                <Route path="/registrar" element={<Register />} />
                <Route path="/entrar" element={<Login />} />
                <Route path="/resetar-senha" element={<ResetPassword />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/editar-perfil" element={<EditProfile />} />
                <Route path="/sobre" element={<About />} />
                <Route path="/criar-colecao" element={<CreateCollection />} />
                <Route path="*" element={<NotFound />} />
            </Routes>

            {!hideFooterRoutes.includes(location.pathname) && <Footer />}
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <ToastCleanup />
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
                <Layout />
            </Router>
        </AuthProvider>
    );
}
