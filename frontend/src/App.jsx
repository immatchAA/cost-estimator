import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Background from "./assets/main_bg.jpg";
import Background2 from "./assets/main_bg1.jpg";
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
        className=" flex flex-col items-center  min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: `url(${Background2})`,
        }}
      >
        <section className="flex flex-col items-center justify-center text-center mt-48   ">
          <span
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-black text-9xl font-medium flex drop-shadow-lg"
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
