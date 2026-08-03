import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MdHistory, MdHome, MdArrowForward } from "react-icons/md";
import "./AddressHistory.css";

function AddressHistory() {

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${import.meta.env.VITE_API_URL}/transfers`, {
          headers: { Authorization: token }
        });

        const transfers = await res.json();

        const byAddress = {};

        const touch = (address, role, moveDate) => {
          if (!address) return;

          if (!byAddress[address]) {
            byAddress[address] = {
              address,
              fromCount: 0,
              toCount: 0,
              lastUsed: moveDate
            };
          }

          if (role === "from") byAddress[address].fromCount += 1;
          if (role === "to") byAddress[address].toCount += 1;

          if (moveDate && (!byAddress[address].lastUsed || moveDate > byAddress[address].lastUsed)) {
            byAddress[address].lastUsed = moveDate;
          }
        };

        (transfers || []).forEach(t => {
          touch(t.oldAddress, "from", t.moveDate);
          touch(t.newAddress, "to", t.moveDate);
        });

        const list = Object.values(byAddress).sort((a, b) => {
          if (!a.lastUsed) return 1;
          if (!b.lastUsed) return -1;
          return b.lastUsed.localeCompare(a.lastUsed);
        });

        setAddresses(list);

      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();

  }, []);

  const useAddress = (address) => {
    navigate("/create", { state: { address } });
  };

  return (
    <div className="address-history-page">

      <h1><MdHistory /> {t("addressHistory.title")}</h1>
      <p className="subtitle">{t("addressHistory.subtitle")}</p>

      {
        loading ? (
          <p className="address-empty">{t("addressHistory.loading")}</p>
        ) : addresses.length === 0 ? (
          <div className="address-empty-box">
            <MdHome />
            <p>{t("addressHistory.empty")}</p>
          </div>
        ) : (
          <div className="address-list">
            {
              addresses.map(item => (
                <div className="address-card" key={item.address}>

                  <div className="address-icon">
                    <MdHome />
                  </div>

                  <div className="address-info">
                    <h3>{item.address}</h3>
                    <div className="address-tags">
                      {item.toCount > 0 && <span className="tag tag-to">{t("addressHistory.movedIn", { count: item.toCount })}</span>}
                      {item.fromCount > 0 && <span className="tag tag-from">{t("addressHistory.movedOut", { count: item.fromCount })}</span>}
                      {item.lastUsed && <span className="tag tag-date">{t("addressHistory.lastUsed", { date: item.lastUsed })}</span>}
                    </div>
                  </div>

                  <button className="use-address-btn" onClick={() => useAddress(item.address)}>
                    {t("addressHistory.useForNewTransfer")} <MdArrowForward />
                  </button>

                </div>
              ))
            }
          </div>
        )
      }

    </div>
  );
}

export default AddressHistory;
