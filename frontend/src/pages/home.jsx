
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MdBolt, MdLocalFireDepartment, MdWaterDrop } from "react-icons/md";
import "../App.css";
import heroImage from "../assets/hero.png";

function Home() {

  const { t } = useTranslation();

  return (
    <>

      <section className="hero">

        <div className="hero-content">

          <h1>
            {t("home.heroTitleLine1")}
            <br />
            {t("home.heroTitleLine2")}
          </h1>

          <p>
            {t("home.heroText")}
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="btn btn-primary">
              {t("home.getStarted")}
            </Link>

            <Link to="/login" className="btn btn-outline">
              {t("home.login")}
            </Link>

          </div>

        </div>


        <div className="hero-image">

          <img
            src={heroImage}
            alt="MoveMate"
          />

        </div>

      </section>


      <section className="features">

        <h2>
          {t("home.featuresTitle")}
        </h2>


        <div className="feature-grid">

          <div className="feature-card">
            <MdBolt />
            <h3>{t("nav.electricity")}</h3>
            <p>
              {t("home.electricityDesc")}
            </p>
          </div>


          <div className="feature-card">
            <MdLocalFireDepartment />
            <h3>{t("nav.gas")}</h3>
            <p>
              {t("home.gasDesc")}
            </p>
          </div>


          <div className="feature-card">
            <MdWaterDrop />
            <h3>{t("nav.water")}</h3>
            <p>
              {t("home.waterDesc")}
            </p>
          </div>

        </div>

      </section>

    </>
  );
}

export default Home;