import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import registerImage from "./assets/register.png";
import { toast } from "react-toastify";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const register = async (e) => {

    e.preventDefault();


    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
  username: name,
  email,
  password
})

      });


      const data = await response.json();


      if (response.ok) {

        toast.success("Account created successfully!");

        navigate("/login");


      } else {

        toast.error(data.message || "Registration failed");

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
          Welcome to our app
        </h1>


        <p>
          Create your account and start using our platform today.
        </p>


        <img

          src={registerImage}

          alt="app illustration"

        />


      </div>




      {/* RIGHT SIDE */}


      <div className="register-right">


        <div className="register-card">


          <h1>
            Create your MoveMate account
          </h1>



          <p className="auth-subtitle">

            Join us today

          </p>




          <form onSubmit={register}>


            <input

              type="text"

              placeholder="Full name"

              value={name}

              onChange={(e)=>setName(e.target.value)}

              required

            />




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

              Create account

            </button>



          </form>





          <div className="auth-footer">


            Already have an account?


            <Link to="/login">

              Login

            </Link>



          </div>



        </div>


      </div>



    </div>

  );

}


export default Register;