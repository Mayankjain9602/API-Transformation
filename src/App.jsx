import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./pages/Home";
import DocumentDetails from "./pages/DocumentDetails";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/document/:id" element={<DocumentDetails />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
