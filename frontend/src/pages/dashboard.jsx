import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import { useCurrency } from "../CurrencyContext";
import MoveReminderBanner from "../MoveReminderBanner";
import HeaderScene from "../illustrations/HeaderScene";

import {
  MdAccountBalanceWallet,
  MdSwapHoriz,
  MdMiscellaneousServices,
  MdBolt,
  MdWaterDrop,
  MdLocalFireDepartment,
  MdAccountBalance,
  MdFastfood,
  MdDirectionsCar,
  MdShoppingCart,
  MdHome,
  MdCategory
} from "react-icons/md";

import "./Dashboard.css";

const CATEGORY_ICONS = {
  electricity: MdBolt,
  gas: MdLocalFireDepartment,
  water: MdWaterDrop,
  arnona: MdAccountBalance,
  Utilities: MdBolt,
  Food: MdFastfood,
  Transport: MdDirectionsCar,
  Shopping: MdShoppingCart,
  Home: MdHome
};

const getExpenseIcon = (category) => CATEGORY_ICONS[category] || MdCategory;

const CHART_COLORS = ["#6C5CE7", "#14B8A6", "#FF7A59", "#FF6B9B", "#FFB020", "#22C55E"];

function Dashboard() {

  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { symbol } = useCurrency();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${import.meta.env.VITE_API_URL}/dashboard`, {
          headers: { Authorization: token }
        });

        const json = await res.json();
        setData(json);

      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

  }, []);

  const axisColor = darkMode ? "#9DA1C4" : "#8A8FB3";
  const gridColor = darkMode ? "#2B2D50" : "#EEF0F8";
  const tooltipBg = darkMode ? "#1C1E3D" : "#FFFFFF";
  const tooltipText = darkMode ? "#F1F2FA" : "#16182B";

  if (loading) {
    return <div className="dashboard-loading">{t("common.loading")}</div>;
  }

  const monthlyData = data?.monthlyData?.length ? data.monthlyData : [];
  const categoryData = data?.categoryData?.length ? data.categoryData : [];
  const recentExpenses = data?.recentExpenses || [];

  return (
    <div className="dashboard-page">

      <MoveReminderBanner />

      <div className="dashboard-header">
        <div>
          <h1>{t("dashboard.greeting", { name: "Giorgi" })}</h1>
          <p>{t("dashboard.subtitle")}</p>
        </div>

        <HeaderScene className="header-illustration" />

        <button className="profile-btn" onClick={() => navigate("/profile")}>
          <span className="avatar">G</span>
          {t("dashboard.myProfile")}
        </button>
      </div>

      <div className="stats">

        <div className="stat-card balance">
          <span className="stat-icon"><MdAccountBalanceWallet /></span>
          <span className="stat-label">{t("dashboard.totalSpent")}</span>
          <h2>{symbol}{data?.total || 0}</h2>
          <p>{t("dashboard.acrossAllExpenses")}</p>
        </div>

        <div className="stat-card transfers">
          <span className="stat-icon"><MdSwapHoriz /></span>
          <span className="stat-label">{t("dashboard.transfers")}</span>
          <h2>{data?.totalTransfers || 0}</h2>
          <p>{t("dashboard.totalTransfersCreated")}</p>
        </div>

        <div className="stat-card pending">
          <span className="stat-icon"><MdMiscellaneousServices /></span>
          <span className="stat-label">{t("dashboard.services")}</span>
          <h2>{data?.totalServices || 0}</h2>
          <p>{t("dashboard.utilityServicesTracked")}</p>
        </div>

      </div>

      <div className="dashboard-grid">

        <div className="chart-card">
          <h2>{t("dashboard.monthlySpending")}</h2>

          {
            monthlyData.length === 0 ? (
              <p className="chart-empty">{t("dashboard.noExpensesYet")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moneyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={gridColor} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 13 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: axisColor, fontSize: 13 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 8px 24px rgba(22,24,43,0.12)",
                      background: tooltipBg,
                      color: tooltipText
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#6C5CE7"
                    strokeWidth={3}
                    fill="url(#moneyGradient)"
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )
          }
        </div>

        <div className="chart-card">
          <h2>{t("dashboard.spendingByCategory")}</h2>

          {
            categoryData.length === 0 ? (
              <p className="chart-empty">{t("dashboard.noExpensesYet")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {
                      categoryData.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))
                    }
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 8px 24px rgba(22,24,43,0.12)",
                      background: tooltipBg,
                      color: tooltipText
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: 13, color: axisColor }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>

        <div className="transactions">
          <h2>{t("dashboard.recentActivity")}</h2>

          {
            recentExpenses.length === 0 ? (
              <p className="chart-empty">{t("dashboard.noRecentExpenses")}</p>
            ) : (
              recentExpenses.map((item) => {
                const Icon = getExpenseIcon(item.category);
                return (
                  <div className="transaction" key={item._id}>
                    <div className="transaction-left">
                      <span className="transaction-icon"><Icon /></span>
                      <div>
                        <h3>{item.title}</h3>
                        <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                    <strong>-{symbol}{item.amount}</strong>
                  </div>
                );
              })
            )
          }
        </div>

      </div>

      <div className="quick">
        <h2>{t("dashboard.quickActions")}</h2>

        <div className="quick-buttons">
          <button className="btn-primary" onClick={() => navigate("/create")}>{t("dashboard.newTransfer")}</button>
          <button className="btn-secondary" onClick={() => navigate("/expenses")}>{t("dashboard.viewBills")}</button>
          <button className="btn-ghost" onClick={() => navigate("/cards")}>{t("dashboard.paymentMethods")}</button>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
