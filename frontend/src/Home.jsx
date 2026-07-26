import Navbar from "./Navbar";
import "./App.css";

function Home() {

  return (
    <>
      <Navbar />

      <div className="container">

        <h1>Welcome to Auth App</h1>

        <p>
          This is your secure authentication system.
        </p>

      </div>
    </>
  );
}

export default Home;