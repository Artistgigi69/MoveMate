import { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
function Transfers() {

  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
const navigate = useNavigate();
  // 🔄 GET TRANSFERS
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

  // ❌ DELETE TRANSFER
 const deleteTransfer = async (id) => {

  const confirmDelete = window.confirm("Are you sure?");
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

  // 📊 STATS
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

  // 🔄 LOADER
  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <Navbar />

      <div className="container">

        <h1>My Transfers</h1>

        {/* 📊 DASHBOARD */}
        <div style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px"
        }}>
          <div style={{ color: "orange" }}>
            Pending: {stats.Pending}
          </div>

          <div style={{ color: "blue" }}>
            Processing: {stats.Processing}
          </div>

          <div style={{ color: "green" }}>
            Completed: {stats.Completed}
          </div>
        </div>

        {/* 🔍 FILTER */}
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => setFilter("All")}>All</button>
          <button onClick={() => setFilter("Pending")}>Pending</button>
          <button onClick={() => setFilter("Processing")}>Processing</button>
          <button onClick={() => setFilter("Completed")}>Completed</button>
        </div>

        {/* 📦 LIST */}
        {
          transfers
            .filter(item => {
              if (filter === "All") return true;
              return item.services.some(s => s.status === filter);
            })
            .map(item => (

              <div
                key={item._id}
                className="transfer-card"
                style={{
                  border:
                    item.services.some(s => s.status === "Pending")
                      ? "2px solid orange"
                      : item.services.some(s => s.status === "Processing")
                      ? "2px solid blue"
                      : "2px solid green"
                }}
              >

                {/* ❌ DELETE BUTTON */}
                <div style={{ marginBottom: "10px" }}>
  <button
    className="btn btn-primary"
    onClick={() => navigate(`/edit-transfer/${item._id}`)}
  >
    Edit
  </button>

  <button
    className="btn btn-delete"
    onClick={() => deleteTransfer(item._id)}
  >
    Delete
  </button>
</div>

                <h3>Move Transfer</h3>

                <p>From: {item.oldAddress}</p>
                <p>To: {item.newAddress}</p>
                <p>Move date: {item.moveDate}</p>

                <h4>Services:</h4>

                {
                  item.services.map((s, index) => (
                    <div key={index}>
                      <p>{s.name.toUpperCase()}</p>

                      <span
                        style={{
                          color:
                            s.status === "Pending"
                              ? "orange"
                              : s.status === "Processing"
                              ? "blue"
                              : "green",
                          fontWeight: "bold"
                        }}
                      >
                        Status: {s.status}
                      </span>
                    </div>
                  ))
                }

              </div>

            ))
        }

      </div>
    </>
  );
}

export default Transfers;