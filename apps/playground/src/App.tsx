import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { lessons } from "./lessons";
import { LessonScreen } from "./components/LessonScreen";
import { NotFound } from "./components/NotFound";

const firstLesson = lessons[0]?.id ?? "";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`/lesson/${firstLesson}`} replace />}
        />
        <Route path="/lesson/:id" element={<LessonScreen />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
