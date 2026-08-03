import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import MountainScene from "./illustrations/MountainScene";
import LanguageSwitcher from "./LanguageSwitcher";
import "./Auth.css";

function Login() {

  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [needsCode, setNeedsCode] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");


  const login = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {

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


      if (response.ok && data.requires2FA) {

        setTempToken(data.tempToken);
        setNeedsCode(true);

      } else if (response.ok) {

        toast.success(t("auth.loginSuccess"));

        localStorage.setItem("token", data.token);

        navigate("/profile");

      } else {

        toast.error(data.message || t("auth.loginFailed"));

      }

    } catch (error) {

      console.log(error);

      toast.error(t("auth.serverError"));
    }

  };


  const verifyCode = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/verify-login`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          tempToken,
          code
        })

      });

      const data = await response.json();

      if (response.ok) {

        toast.success(t("auth.loginSuccess"));

        localStorage.setItem("token", data.token);

        navigate("/profile");

      } else {

        toast.error(data.message || t("auth.invalidCode"));

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


        <h1>
          {t("auth.welcomeBack")}
        </h1>


        <p>
          {t("auth.loginIntro")}
        </p>

<MountainScene className="scene-illustration" />

      </div>



      {/* RIGHT SIDE */}

      <div className="register-right">


        <div className="register-card">


          <LanguageSwitcher className="on-light auth-lang-switcher" />


          {
            needsCode ? (

              <>

                <h1>
                  {t("auth.verificationCodeTitle")}
                </h1>

                <p className="auth-subtitle">
                  {t("auth.verificationCodeSubtitle")}
                </p>

                <form onSubmit={verifyCode}>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    autoFocus
                    required
                  />

                  <button type="submit">
                    {t("auth.verify")}
                  </button>

                </form>

                <div className="auth-footer">
                  <button type="button" className="link-btn" onClick={() => setNeedsCode(false)}>
                    {t("auth.backToLogin")}
                  </button>
                </div>

              </>

            ) : (

              <>

                <h1>
                  {t("auth.loginTitle")}
                </h1>


                <p className="auth-subtitle">
                  {t("auth.loginSubtitle")}
                </p>


                <form onSubmit={login}>


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
                    {t("auth.loginButton")}
                  </button>


                </form>


                <div className="auth-footer">

                  {t("auth.noAccount")}

                  <Link to="/register">
                    {t("auth.registerLink")}
                  </Link>

                </div>

              </>

            )
          }


        </div>

      </div>


    </div>

  );

}

export default Login;