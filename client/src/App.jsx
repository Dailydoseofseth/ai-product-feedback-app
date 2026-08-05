import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AddFeedbackPage from "./pages/AddFeedbackPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/add-feedback" element={<AddFeedbackPage />} />
    </Routes>
  );
}

export default App;
