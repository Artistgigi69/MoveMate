import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdChecklist, MdAdd, MdClose } from "react-icons/md";
import HeaderScene from "../illustrations/HeaderScene";
import "./Checklist.css";

function Checklist() {

  const { t } = useTranslation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  const load = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/checklist`, {
        headers: { Authorization: token }
      });

      const data = await res.json();
      setItems(data);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (item) => {

    setItems(items.map(i => i._id === item._id ? { ...i, done: !i.done } : i));

    try {
      const token = localStorage.getItem("token");

      await fetch(`${import.meta.env.VITE_API_URL}/checklist/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({ done: !item.done })
      });

    } catch (error) {
      console.log(error);
    }
  };

  const addItem = async (e) => {

    e.preventDefault();

    if (!newTitle.trim()) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/checklist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({ title: newTitle.trim() })
      });

      const item = await res.json();
      setItems([...items, item]);
      setNewTitle("");

    } catch (error) {
      console.log(error);
    }
  };

  const removeItem = async (id) => {

    setItems(items.filter(i => i._id !== id));

    try {
      const token = localStorage.getItem("token");

      await fetch(`${import.meta.env.VITE_API_URL}/checklist/${id}`, {
        method: "DELETE",
        headers: { Authorization: token }
      });

    } catch (error) {
      console.log(error);
    }
  };

  const doneCount = items.filter(i => i.done).length;

  return (
    <div className="checklist-page">

      <div className="page-header-row">
        <div>
          <h1><MdChecklist /> {t("checklist.title")}</h1>
          <p className="subtitle">{t("checklist.subtitle")}</p>
        </div>
        <HeaderScene className="header-illustration" />
      </div>

      {
        !loading && items.length > 0 && (
          <div className="checklist-progress">
            <div className="checklist-progress-bar">
              <div
                className="checklist-progress-fill"
                style={{ width: `${(doneCount / items.length) * 100}%` }}
              />
            </div>
            <span>{doneCount}/{items.length}</span>
          </div>
        )
      }

      <div className="checklist-card">

        {
          loading ? (
            <p className="checklist-empty">{t("common.loading")}</p>
          ) : (
            items.map(item => (
              <div className={`checklist-row ${item.done ? "done" : ""}`} key={item._id}>

                <label className="checklist-check">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggle(item)}
                  />
                  <span className="checklist-box" />
                  <span className="checklist-text">{item.title}</span>
                </label>

                <button className="checklist-remove" onClick={() => removeItem(item._id)}>
                  <MdClose />
                </button>

              </div>
            ))
          )
        }

        <form className="checklist-add" onSubmit={addItem}>
          <input
            placeholder={t("checklist.addPlaceholder")}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit"><MdAdd /></button>
        </form>

      </div>

    </div>
  );
}

export default Checklist;
