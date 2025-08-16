import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./pages/Home.tsx";
import Library from "./pages/Library.tsx";
import NotFound from "./pages/NotFound.tsx";
import Register from "./pages/Register.tsx";

export default function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/biblioteca" element={<Library/>}/>
                <Route path="/registrar" element={<Register/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </Router>
    )
}
