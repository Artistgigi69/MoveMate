import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MdCheckCircle, MdHome } from "react-icons/md";
import "./ConfirmMeter.css";

function ConfirmMeter() {

  const { token } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/transfers/public/confirm/${token}`);

      if (!res.ok) {
        setNotFound(true);
        return;
      }

      const json = await res.json();
      setData(json);

    } catch (error) {
      console.log(error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const confirm = async () => {

    setConfirming(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/transfers/public/confirm/${token}`, {
        method: "POST"
      });

      if (res.ok) {
        setData(prev => ({ ...prev, confirmedByTenant: true }));
      }

    } catch (error) {
      console.log(error);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return <div className="confirm-page"><div className="confirm-box">Loading...</div></div>;
  }

  if (notFound) {
    return <div className="confirm-page"><div className="confirm-box">Link not found or expired.</div></div>;
  }

  return (
    <div className="confirm-page">
      <div className="confirm-box">

        <MdHome className="confirm-icon" />

        <h1>Confirm meter reading</h1>

        <p className="confirm-address">{data.address}</p>
        <p className="confirm-service">{data.serviceName?.toUpperCase()}</p>

        {
          data.meterPhoto && (
            <img
              className="confirm-photo"
              src={`${import.meta.env.VITE_API_URL}/uploads/${data.meterPhoto}`}
              alt="Meter reading"
            />
          )
        }

        {
          data.confirmedByTenant ? (
            <div className="confirm-done">
              <MdCheckCircle /> Confirmed{data.confirmedAt ? ` on ${new Date(data.confirmedAt).toLocaleDateString()}` : ""}
            </div>
          ) : (
            <button className="confirm-btn" onClick={confirm} disabled={confirming}>
              {confirming ? "Confirming..." : "Confirm this reading"}
            </button>
          )
        }

      </div>
    </div>
  );
}

export default ConfirmMeter;
