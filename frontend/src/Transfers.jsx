import { useEffect, useState } from "react";
import "./Transfers.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MdAddAPhoto, MdSend, MdMailOutline, MdCheckCircle, MdPictureAsPdf } from "react-icons/md";

function Transfers() {

  const { t } = useTranslation();

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const getTransfers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/transfers`,
        {
          headers: {
            Authorization: token
          }
        }
      );

      const data = await response.json();
      setTransfers(data);

    } catch (error) {
      console.log("ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadMeterPhoto = async (transferId, serviceIndex, file) => {

    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("serviceIndex", serviceIndex);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/transfers/${transferId}/meter-photo`,
        {
          method: "POST",
          headers: {
            Authorization: token
          },
          body: formData
        }
      );

      const updated = await res.json();

      setTransfers(transfers.map(t => t._id === transferId ? updated : t));

    } catch (error) {
      console.log("METER PHOTO ERROR:", error);
    }
  };

  const sendRequest = async (transfer, serviceIndex) => {

    const service = transfer.services[serviceIndex];

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/transfers/${transfer._id}/services/${serviceIndex}/send`,
        {
          method: "PUT",
          headers: { Authorization: token }
        }
      );

      const updated = await res.json();

      setTransfers(transfers.map(t => t._id === transfer._id ? updated : t));

      // Open the user's own mail client with a ready-to-send request —
      // we don't guess the provider's real address, they fill that in.
      const subject = encodeURIComponent(`${service.name.toUpperCase()} transfer request — ${transfer.oldAddress}`);
      const body = encodeURIComponent(
        `Hello,\n\nPlease transfer the ${service.name} account for the following move:\n\n` +
        `From: ${transfer.oldAddress}\n` +
        `To: ${transfer.newAddress}\n` +
        `Move date: ${transfer.moveDate}\n\n` +
        `Thank you.`
      );

      window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");

      toast.success(t("transfers.requestMarkedSent"));

    } catch (error) {
      console.log("SEND REQUEST ERROR:", error);
      toast.error(t("auth.serverError"));
    }
  };

  const notifyTenant = (transfer, service) => {

    if (!transfer.newTenant?.email) return;

    const confirmUrl = `${window.location.origin}/confirm/${service.confirmToken}`;

    const subject = encodeURIComponent(`Please confirm the ${service.name} meter reading`);
    const body = encodeURIComponent(
      `Hi ${transfer.newTenant.name || ""},\n\n` +
      `You're moving into ${transfer.oldAddress}. Please confirm the ${service.name} meter reading here:\n\n` +
      `${confirmUrl}\n\nThanks!`
    );

    window.open(`mailto:${transfer.newTenant.email}?subject=${subject}&body=${body}`, "_blank");
  };

  const downloadPdf = async () => {

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/export/history-pdf`, {
        headers: { Authorization: token }
      });

      if (!res.ok) {
        toast.error(t("transfers.exportFailed"));
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "movemate-history.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.log("PDF EXPORT ERROR:", error);
      toast.error(t("auth.serverError"));
    }
  };

  const deleteTransfer = async (id) => {

    const confirmDelete = window.confirm(t("transfers.confirmDelete"));
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:5000/transfers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token
        }
      });

      setTransfers(transfers.filter(t => t._id !== id));

    } catch (error) {
      console.log("DELETE ERROR:", error);
    }
  };

  useEffect(() => {
    getTransfers();
  }, []);

  const stats = {
    Pending: 0,
    Processing: 0,
    Completed: 0
  };

  transfers.forEach(item => {
    item.services.forEach(s => {
      if (stats[s.status] !== undefined) {
        stats[s.status]++;
      }
    });
  });

  const statusClass = (status) => {
    if (status === "Pending") return "status-pending";
    if (status === "Processing") return "status-processing";
    return "status-completed";
  };

  const statusLabel = (status) => {
    if (status === "Pending") return t("transfers.pending");
    if (status === "Processing") return t("transfers.processing");
    return t("transfers.completed");
  };

  const cardStatusClass = (services) => {
    if (services.some(s => s.status === "Pending")) return "border-pending";
    if (services.some(s => s.status === "Processing")) return "border-processing";
    return "border-completed";
  };

  if (loading) {
    return <div className="transfers-loading">{t("common.loading")}</div>;
  }

  return (
    <div className="transfers-page">

      <div className="transfers-header-row">
        <h1>{t("transfers.myTransfers")}</h1>
        <button className="export-pdf-btn" onClick={downloadPdf}>
          <MdPictureAsPdf /> {t("transfers.exportPdf")}
        </button>
      </div>

      <div className="transfer-stats">
        <div className="stat-pill status-pending">
          {t("transfers.pending")}: {stats.Pending}
        </div>
        <div className="stat-pill status-processing">
          {t("transfers.processing")}: {stats.Processing}
        </div>
        <div className="stat-pill status-completed">
          {t("transfers.completed")}: {stats.Completed}
        </div>
      </div>

      <div className="transfer-filters">
        <button
          className={filter === "All" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("All")}
        >
          {t("transfers.all")}
        </button>
        <button
          className={filter === "Pending" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("Pending")}
        >
          {t("transfers.pending")}
        </button>
        <button
          className={filter === "Processing" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("Processing")}
        >
          {t("transfers.processing")}
        </button>
        <button
          className={filter === "Completed" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("Completed")}
        >
          {t("transfers.completed")}
        </button>
      </div>

      <div className="transfer-list">
        {
          transfers
            .filter(item => {
              if (filter === "All") return true;
              return item.services.some(s => s.status === filter);
            })
            .map(item => (

              <div
                key={item._id}
                className={`transfer-card ${cardStatusClass(item.services)}`}
              >

                <div className="transfer-card-actions">
                  <button
                    className="btn-edit"
                    onClick={() => navigate(`/edit-transfer/${item._id}`)}
                  >
                    {t("common.edit")}
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() => deleteTransfer(item._id)}
                  >
                    {t("common.delete")}
                  </button>
                </div>

                <h3>{t("transfers.moveTransfer")}</h3>

                <p className="transfer-address">{t("transfers.from", { address: item.oldAddress })}</p>
                <p className="transfer-address">{t("transfers.to", { address: item.newAddress })}</p>
                <p className="transfer-date">{t("transfers.moveDateLabel", { date: item.moveDate })}</p>

                {
                  item.newTenant && item.newTenant.name && (
                    <p className="transfer-recipient">
                      {t("transfers.sentTo")} <strong>{item.newTenant.name}</strong>
                      {item.newTenant.phone && ` · ${item.newTenant.phone}`}
                    </p>
                  )
                }

                <h4>{t("transfers.servicesLabel")}</h4>

                <div className="transfer-services">
                  {
                    item.services.map((s, index) => (
                      <div key={index} className="service-row">

                        <div className="service-row-top">
                          <p>{s.name.toUpperCase()}</p>

                          <div className="service-row-right">
                            <span className={statusClass(s.status)}>
                              {t("transfers.statusText", { status: statusLabel(s.status) })}
                            </span>

                            {
                              s.meterPhoto ? (
                                <a
                                  href={`${import.meta.env.VITE_API_URL}/uploads/${s.meterPhoto}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <img
                                    className="meter-thumb"
                                    src={`${import.meta.env.VITE_API_URL}/uploads/${s.meterPhoto}`}
                                    alt={`${s.name} meter reading`}
                                  />
                                </a>
                              ) : (
                                <label className="meter-upload-btn">
                                  <MdAddAPhoto />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => uploadMeterPhoto(item._id, index, e.target.files[0])}
                                  />
                                </label>
                              )
                            }
                          </div>
                        </div>

                        <div className="service-timeline">
                          <div className={`timeline-step ${s.requestSentAt || s.status !== "Pending" ? "done" : "active"}`}>
                            <span className="timeline-dot" />
                            {t("transfers.stepNotSent")}
                          </div>
                          <div className={`timeline-step ${s.status === "Completed" ? "done" : (s.requestSentAt || s.status !== "Pending") ? "active" : ""}`}>
                            <span className="timeline-dot" />
                            {t("transfers.stepSent")}
                            {s.requestSentAt && <small>{new Date(s.requestSentAt).toLocaleDateString()}</small>}
                          </div>
                          <div className={`timeline-step ${s.status === "Completed" ? "active" : ""}`}>
                            <span className="timeline-dot" />
                            {t("transfers.stepCompleted")}
                          </div>
                        </div>

                        <div className="service-row-actions">
                          {
                            s.status === "Pending" && (
                              <button className="mini-btn" onClick={() => sendRequest(item, index)}>
                                <MdSend /> {t("transfers.sendRequest")}
                              </button>
                            )
                          }

                          {
                            item.newTenant?.email && (
                              s.confirmedByTenant ? (
                                <span className="mini-confirmed">
                                  <MdCheckCircle /> {t("transfers.tenantConfirmed")}
                                </span>
                              ) : (
                                <button className="mini-btn" onClick={() => notifyTenant(item, s)}>
                                  <MdMailOutline /> {t("transfers.notifyTenant")}
                                </button>
                              )
                            )
                          }
                        </div>

                      </div>
                    ))
                  }
                </div>

              </div>

            ))
        }
      </div>

    </div>
  );
}

export default Transfers;