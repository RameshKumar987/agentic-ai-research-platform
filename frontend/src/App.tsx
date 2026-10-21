import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { ToastProvider } from "./components/Toast";
import { ArchitecturePage } from "./pages/Architecture";
import { Documents } from "./pages/Documents";
import { NewResearch } from "./pages/NewResearch";
import { NotFound } from "./pages/NotFound";
import { Overview } from "./pages/Overview";
import { Report } from "./pages/Report";
import { SystemStatus } from "./pages/SystemStatus";

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Overview />} />
              <Route path="new" element={<NewResearch />} />
              <Route path="projects" element={<Documents />} />
              <Route path="projects/:id" element={<Report />} />
              <Route path="architecture" element={<ArchitecturePage />} />
              <Route path="architecture/:id" element={<ArchitecturePage />} />
              <Route path="status" element={<SystemStatus />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
