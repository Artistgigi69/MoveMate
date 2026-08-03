import { useState } from "react";
import "./CreateTransfer.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MdBolt, MdLocalFireDepartment, MdWaterDrop, MdAccountBalance } from "react-icons/md";

const SERVICE_ICONS = {
  electricity: MdBolt,
  gas: MdLocalFireDepartment,
  water: MdWaterDrop,
  arnona: MdAccountBalance
};

function CreateTransfer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [oldAddress, setOldAddress] = useState(location.state?.address || "");
  const [newAddress, setNewAddress] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [services, setServices] = useState([]);

  // New tenant taking over the old address
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantPhone, setNewTenantPhone] = useState("");
  const [newTenantEmail, setNewTenantEmail] = useState("");
  const [newTenantId, setNewTenantId] = useState("");

  const changeService = (service) => {
    if (services.includes(service)) {
      setServices(services.filter(item => item !== service));
    } else {
      setServices([...services, service]);
    }
  };

  const createTransfer = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/transfers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify({
            oldAddress,
            newAddress,
            moveDate,
            services,
            newTenant: {
              name: newTenantName,
              phone: newTenantPhone,
              email: newTenantEmail,
              idNumber: newTenantId
            }
          })
        }
      );

      const data = await response.json();
      console.log("CREATE:", data);

      toast.success(t("transfers.transferCreated"));
      navigate("/transfers");

      setOldAddress("");
      setNewAddress("");
      setMoveDate("");
      setServices([]);
      setNewTenantName("");
      setNewTenantPhone("");
      setNewTenantEmail("");
      setNewTenantId("");

    } catch (error) {
      toast.error(t("transfers.somethingWrong"));
      console.log(error);
    }
  };

  return (
    <div className="create-transfer-page">

      <h1>{t("transfers.createTransfer")}</h1>
      <p className="subtitle">{t("transfers.createTransferSubtitle")}</p>

      <div className="transfer-form-card">

        <div className="form-section">
          <label className="field-label">{t("transfers.moveDetails")}</label>

          <div className="field-group">
            <input
              placeholder={t("transfers.oldAddress")}
              value={oldAddress}
              onChange={(e) => setOldAddress(e.target.value)}
            />

            <input
              placeholder={t("transfers.newAddress")}
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />

            <input
              type="date"
              value={moveDate}
              onChange={(e) => setMoveDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-section">
          <label className="field-label">{t("transfers.servicesToTransfer")}</label>

          <div className="service-grid">
            {
              ["electricity", "gas", "water", "arnona"].map(service => {
                const ServiceIcon = SERVICE_ICONS[service];
                return (
                  <label
                    key={service}
                    className={
                      services.includes(service)
                        ? `service-option ${service} selected`
                        : `service-option ${service}`
                    }
                  >
                    <input
                      type="checkbox"
                      checked={services.includes(service)}
                      onChange={() => changeService(service)}
                    />

                    <span className="service-icon"><ServiceIcon /></span>
                    <span className="service-name">{t(`nav.${service}`)}</span>
                  </label>
                );
              })
            }
          </div>
        </div>

        <div className="form-section">
          <label className="field-label">{t("transfers.newTenantSection")}</label>
          <p className="field-hint">
            {t("transfers.newTenantHint")}
          </p>

          <div className="field-group">
            <input
              placeholder={t("transfers.fullName")}
              value={newTenantName}
              onChange={(e) => setNewTenantName(e.target.value)}
            />

            <div className="field-row">
              <input
                placeholder={t("transfers.phoneNumber")}
                value={newTenantPhone}
                onChange={(e) => setNewTenantPhone(e.target.value)}
              />

              <input
                placeholder={t("transfers.email")}
                type="email"
                value={newTenantEmail}
                onChange={(e) => setNewTenantEmail(e.target.value)}
              />
            </div>

            <input
              placeholder={t("transfers.idNumber")}
              maxLength={9}
              value={newTenantId}
              onChange={(e) => setNewTenantId(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        <button className="submit-btn" onClick={createTransfer}>
          {t("transfers.createTransfer")}
        </button>

      </div>

    </div>
  );
}

export default CreateTransfer;