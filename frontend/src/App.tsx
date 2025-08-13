import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Library from "./pages/Library.tsx";

export default function App() {

  return (
      <Router>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/biblioteca" element={<Library />} />
          </Routes>
      </Router>
  )
}
