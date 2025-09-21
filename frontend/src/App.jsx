import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Background7 from "./assets/main_bg6.jpg";

function App() {
  return (
    <>
      {/* Navigation Bar */}
      <header className="bg-[#E8E8E8] shadow-md border-b border-gray-200">
        <div className="container flex items-center h-20 px-6 justify-between">
          {/* Logo / Title */}
          <Link
            to="/"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-[#176bb7] text-2xl font-semibold hover:text-blue-700 transition"
          >
            ARCHITECTURAL AI COST ESTIMATOR
          </Link>

          {/* Navigation Links */}
          <nav className="flex gap-7">
            <Link
              to="/"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              className="text-[#176bb7] hover:text-[#176bb7] text-lg font-medium transition"
            >
              Home
            </Link>
            <Link
              to="/login"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              className="text-[#176bb7] hover:text-[#176bb7] text-lg font-medium transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              className="text-[#176bb7] hover:text-[#176bb7] text-lg font-medium transition"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main
        className="flex flex-col min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: `url(${Background7})`,
        }}
      >
        <section className="flex flex-col ml-70 mt-95">
          <span
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-[#176bb7] text-9xl font-medium flex drop-shadow-lg w-5"
          >
            COST SMARTER
          </span>
          <p
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-[#176bb7] text-2xl font-light mt-3 drop-shadow-sm"
          >
            Simulate your cost with AI before you build
          </p>
        </section>
      </main>
    </>
  );
}

export default App;
