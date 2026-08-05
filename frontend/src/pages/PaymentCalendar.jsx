import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdCalendarMonth, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useCurrency } from "../CurrencyContext";
import HeaderScene from "../illustrations/HeaderScene";
import "./PaymentCalendar.css";

const NAV_CATEGORIES = ["electricity", "gas", "water", "arnona"];

const CATEGORY_KEYS = {
  Food: "categoryFood",
  Transport: "categoryTransport",
  Utilities: "categoryUtilities",
  Shopping: "categoryShopping",
  Home: "categoryHome",
  Other: "categoryOther"
};

function PaymentCalendar() {

  const { t, i18n } = useTranslation();
  const { symbol } = useCurrency();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {

    const load = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${import.meta.env.VITE_API_URL}/expenses`, {
          headers: { Authorization: token }
        });

        setExpenses(await res.json());

      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    load();

  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Map "YYYY-M-D" -> expenses on that day, for the currently viewed month.
  const byDay = useMemo(() => {
    const map = {};

    expenses.forEach(item => {
      const d = new Date(item.createdAt);
      if (d.getFullYear() !== year || d.getMonth() !== month) return;

      const key = d.getDate();
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });

    return map;
  }, [expenses, year, month]);

  const monthTotal = Object.values(byDay)
    .flat()
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = cursor.toLocaleDateString(i18n.language, { month: "long", year: "numeric" });

  const weekdayLabels = useMemo(() => {
    const base = new Date(2024, 0, 7); // a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(i18n.language, { weekday: "short" });
    });
  }, [i18n.language]);

  const changeMonth = (delta) => {
    setCursor(new Date(year, month + delta, 1));
    setSelectedDay(null);
  };

  const dayItems = selectedDay ? (byDay[selectedDay] || []) : [];

  const categoryLabel = (category) => {
    if (NAV_CATEGORIES.includes(category)) return t(`nav.${category}`);
    const key = CATEGORY_KEYS[category];
    return key ? t(`expenses.${key}`) : category;
  };

  return (
    <div className="calendar-page">

      <div className="page-header-row">
        <div>
          <h1><MdCalendarMonth /> {t("calendar.title")}</h1>
          <p className="subtitle">{t("calendar.subtitle")}</p>
        </div>
        <HeaderScene className="header-illustration" />
      </div>

      <div className="calendar-card">

        <div className="calendar-nav">
          <button onClick={() => changeMonth(-1)} aria-label="Previous month"><MdChevronLeft /></button>
          <div className="calendar-month-label">
            {monthLabel}
            <span className="calendar-month-total">{symbol}{monthTotal}</span>
          </div>
          <button onClick={() => changeMonth(1)} aria-label="Next month"><MdChevronRight /></button>
        </div>

        {
          loading ? (
            <p className="calendar-empty">{t("common.loading")}</p>
          ) : (
            <>
              <div className="calendar-weekdays">
                {weekdayLabels.map(w => <div key={w}>{w}</div>)}
              </div>

              <div className="calendar-grid">
                {
                  cells.map((day, index) => {

                    if (!day) return <div className="calendar-cell empty" key={`e${index}`} />;

                    const items = byDay[day] || [];
                    const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
                    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                    return (
                      <button
                        key={day}
                        className={`calendar-cell ${items.length ? "has-payments" : ""} ${selectedDay === day ? "selected" : ""} ${isToday ? "today" : ""}`}
                        onClick={() => setSelectedDay(items.length ? day : null)}
                      >
                        <span className="calendar-day-number">{day}</span>
                        {
                          items.length > 0 && (
                            <span className="calendar-day-total">{symbol}{total}</span>
                          )
                        }
                      </button>
                    );

                  })
                }
              </div>
            </>
          )
        }

      </div>

      {
        selectedDay && (
          <div className="calendar-detail-card">
            <h2>{t("calendar.paymentsOn", { date: new Date(year, month, selectedDay).toLocaleDateString(i18n.language) })}</h2>

            {
              dayItems.map(item => (
                <div className="calendar-detail-row" key={item._id}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{categoryLabel(item.category)}</span>
                  </div>
                  <strong>{symbol}{item.amount}</strong>
                </div>
              ))
            }
          </div>
        )
      }

    </div>
  );
}

export default PaymentCalendar;
