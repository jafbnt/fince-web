import { Navigate, Route, Routes } from "react-router-dom"
import { AuthView } from "./app/auth"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthView />} />
      <Route path="/signup" element={<AuthView />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
