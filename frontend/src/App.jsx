import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Background from "./assets/main_bg.jpg";
import Background2 from "./assets/main_bg1.jpg";
import Background3 from "./assets/main_bg2.jpg";
import Background4 from "./assets/main_bg3.jpg";
import Background5 from "./assets/main_bg4.jpg";
import Background6 from "./assets/main_bg5.jpg";
import Background7 from "./assets/main_bg6.jpg";

function App() {
  return (
    <>
      {/* Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-300">
        <div className="container flex items-center h-20 px-6 justify-between">
          {/* Logo / Title */}
          <Link
            to="/"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-black text-3xl font-extralight hover:text-gray-700 transition"
          >
            ARCHITECTURAL AI COST ESTIMATOR
          </Link>

          {/* Navigation Links */}
          <nav className="flex gap-7">
            <Link
              to="/"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              className="text-gray-700 hover:text-black text-lg font-light transition"
            >
              Home
            </Link>
            <Link
              to="/login"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              className="text-gray-700 hover:text-black text-lg font-light transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              className="text-gray-700 hover:text-black text-lg font-light transition"
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
        <section className="flex flex-col ml-50 mt-95">
          <span
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-black text-9xl font-medium flex drop-shadow-lg w-5"
          >
            COST SMARTER
          </span>
          <p
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-black text-3xl font-light mt-3 drop-shadow-lg"
          >
            Simulate your cost with AI before you build
          </p>
        </section>
      </main>
    </>
  );
}

export default App;
