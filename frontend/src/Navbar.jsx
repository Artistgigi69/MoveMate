import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function Navbar() {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };


  return (
    <nav className="navbar">

      <h2>MoveMate</h2>

      <div className="nav-links">

<Link to="/">
 Home
</Link>

<Link to="/profile">
 Profile
</Link>

<Link to="/transfers">
  Transfers
</Link>

<Link to="/create">
  Create
</Link>

<button onClick={logout}>
 Logout
</button>

</div>

    </nav>
  );
}

export default Navbar;