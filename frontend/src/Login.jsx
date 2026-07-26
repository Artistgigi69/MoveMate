import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import registerImage from "./assets/register.png";
import { toast } from "react-toastify";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const login = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })

      });


      const data = await response.json();


      if (response.ok) {

        toast.success("Login successful!");

        localStorage.setItem("token", data.token);

        navigate("/profile");

      } else {

        toast.error(data.message || "Login failed");

      }

    } catch (error) {

      console.log(error);

      toast.error("Server error");
    }

  };


  return (

    <div className="register-page">


      {/* LEFT SIDE */}

      <div className="register-left">


        <h1>
          Welcome back 👋
        </h1>


        <p>
          Log in to continue with MoveMate.
        </p>

<div className="illustration-box">
  🚀
</div>

      </div>



      {/* RIGHT SIDE */}

      <div className="register-right">


        <div className="register-card">


          <h1>
            Login
          </h1>


          <p className="auth-subtitle">
            Enter your details
          </p>


          <form onSubmit={login}>


            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />


            <div className="password-field">

  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e)=>setPassword(e.target.value)}
    required
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "🙈" : "👁"}
  </span>

</div>

            <button type="submit">
              Login
            </button>


          </form>


          <div className="auth-footer">

            Don’t have an account?

            <Link to="/register">
              Register
            </Link>

          </div>


        </div>

      </div>


    </div>

  );

}

export default Login;