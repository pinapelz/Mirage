import { Routes, Route } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Import from "./pages/Import";
import Home from "./pages/Home";
import Score from "./pages/Score";
import Chart from "./pages/Chart";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/import" element={<Import />} />
        <Route path="/home" element={<Home />} />
        <Route path="/score" element={<Score />} />
        <Route path="/chart" element={<Chart />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
