import { Link, Route, Routes } from "react-router-dom";
import "./App.css";
import { Button } from "./Button";
import GoogleAnalyticsWrapper from "./analytics/GoogleAnalyticsWrapper";

function HomePage() {
  return (
    <>
      <h1>Home</h1>
      <p>This page is tracked by Google Analytics.</p>
      <Button />
    </>
  );
}

function AboutPage() {
  return (
    <>
      <h1>About</h1>
      <p>Navigate between routes to trigger page_view events.</p>
    </>
  );
}

function NotFoundPage() {
  return (
    <>
      <h1>404</h1>
      <p>Page not found.</p>
    </>
  );
}

function App() {
  return (
    <main>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <GoogleAnalyticsWrapper />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  );
}

export default App;
