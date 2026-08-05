import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import MountainScene from "./illustrations/MountainScene";
import LanguageSwitcher from "./LanguageSwitcher";
import "./Auth.css";

function Register() {

  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");


  const register = async (e) => {

    e.preventDefault();


    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
  username: name,
  email,
  password,
  refCode
})

      });


      const data = await response.json();


      if (response.ok) {

        toast.success(t("auth.registerSuccess"));

        navigate("/login");


      } else {

        toast.error(data.message || t("auth.registerFailed"));

      }


    } catch (error) {

      console.log(error);

      toast.error(t("auth.serverError"));

    }

  };



  return (

    <div className="register-page">


      {/* LEFT SIDE */}

      <div className="register-left">

        <span className="auth-orb auth-orb-1" />
        <span className="auth-orb auth-orb-2" />
        <span className="auth-orb auth-orb-3" />
        <span className="auth-orb auth-orb-4" />
        <span className="auth-orb auth-orb-5" />

        <h1>
          {t("auth.registerTitle")}
        </h1>


        <p>
          {t("auth.registerIntro")}
        </p>


        <MountainScene className="scene-illustration" />


      </div>




      {/* RIGHT SIDE */}


      <div className="register-right">


        <div className="register-card">


          <LanguageSwitcher className="on-light auth-lang-switcher" />


          <h1>
            {t("auth.createAccountTitle")}
          </h1>



          <p className="auth-subtitle">

            {t("auth.createAccountSubtitle")}

          </p>

          {
            refCode && (
              <p className="ref-note">{t("referral.invitedNote")}</p>
            )
          }




          <form onSubmit={register}>


            <input

              type="text"

              placeholder={t("auth.fullNamePlaceholder")}

              value={name}

              onChange={(e)=>setName(e.target.value)}

              required

            />




            <input

              type="email"

              placeholder={t("auth.emailPlaceholder")}

              value={email}

              onChange={(e)=>setEmail(e.target.value)}

              required

            />




            <div className="password-field">

  <input
    type={showPassword ? "text" : "password"}
    placeholder={t("auth.passwordPlaceholder")}
    value={password}
    onChange={(e)=>setPassword(e.target.value)}
    required
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
  </span>

</div>




            <button type="submit">

              {t("auth.createAccountButton")}

            </button>



          </form>





          <div className="auth-footer">


            {t("auth.haveAccount")}


            <Link to="/login">

              {t("auth.loginLink")}

            </Link>



          </div>



        </div>


      </div>



    </div>

  );

}


export default Register;