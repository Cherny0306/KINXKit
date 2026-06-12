import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import Run from "@/pages/Run";
import History from "@/pages/History";
import { AppShell } from "@/components/AppShell";
import { useBootstrap } from "@/hooks/useBootstrap";

export default function App() {
  useBootstrap();
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/runs/:runId" element={<Run />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </Router>
  );
}
