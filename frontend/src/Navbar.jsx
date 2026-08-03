import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "./ThemeContext";
import LanguageSwitcher from "./LanguageSwitcher";
import "./Navbar.css";

import {
  MdDashboard,
  MdAttachMoney,
  MdAddCircle,
  MdSwapHoriz,
  MdLocalShipping,
  MdCreditCard,
  MdPerson,
  MdSettings,
  MdBolt,
  MdLocalFireDepartment,
  MdWaterDrop,
  MdAccountBalance,
  MdHistory,
  MdLightMode,
  MdDarkMode,
  MdChecklist,
  MdCardGiftcard,
  MdWorkspacePremium
} from "react-icons/md";


function Navbar(){


const navigate = useNavigate();

const location = useLocation();

const { darkMode, toggleDarkMode } = useTheme();

const { t } = useTranslation();


const [user,setUser]=useState(null);





const loadUser=()=>{


const token=localStorage.getItem("token");


fetch(
`${import.meta.env.VITE_API_URL}/profile`,
{
headers:{
Authorization:token
}
}
)

.then(res=>res.json())

.then(data=>{

setUser(data);

});


};






useEffect(()=>{


loadUser();



window.addEventListener(
"userUpdated",
loadUser
);



return()=>{

window.removeEventListener(
"userUpdated",
loadUser
);


};


},[]);








const logout=()=>{


localStorage.removeItem("token");

navigate("/login");


};








const menu=[


{
name:t("nav.dashboard"),
path:"/dashboard",
icon:<MdDashboard/>
},


{
name:t("nav.expenses"),
path:"/expenses",
icon:<MdAttachMoney/>
},


{
name:t("nav.addExpense"),
path:"/add-expense",
icon:<MdAddCircle/>
},


{
name:t("nav.electricity"),
path:"/utilities/electricity",
icon:<MdBolt/>
},


{
name:t("nav.gas"),
path:"/utilities/gas",
icon:<MdLocalFireDepartment/>
},


{
name:t("nav.water"),
path:"/utilities/water",
icon:<MdWaterDrop/>
},


{
name:t("nav.arnona"),
path:"/utilities/arnona",
icon:<MdAccountBalance/>
},


{
name:t("nav.transfers"),
path:"/transfers",
icon:<MdSwapHoriz/>
},


{
name:t("nav.createTransfer"),
path:"/create",
icon:<MdLocalShipping/>
},


{
name:t("nav.addressHistory"),
path:"/address-history",
icon:<MdHistory/>
},


{
name:t("nav.checklist"),
path:"/checklist",
icon:<MdChecklist/>
},


{
name:t("nav.referrals"),
path:"/referrals",
icon:<MdCardGiftcard/>
},


{
name:t("nav.premium"),
path:"/premium",
icon:<MdWorkspacePremium/>
},


{
name:t("nav.paymentMethods"),
path:"/cards",
icon:<MdCreditCard/>
},


{
name:t("nav.profile"),
path:"/profile",
icon:<MdPerson/>
},


{
name:t("nav.settings"),
path:"/settings",
icon:<MdSettings/>
}


];








return(



<aside className="sidebar">






<div className="logo">

<MdLocalShipping />

<span>
MoveMate
</span>


</div>








{
user &&

<div className="sidebar-user">


<img

src={

user.avatar

?

`${import.meta.env.VITE_API_URL}/uploads/${user.avatar}`

:

"https://i.pravatar.cc/150"

}

/>



<div>

<h3>

{user.username}

</h3>


<p>

{t("nav.premiumUser")}

</p>


</div>



</div>

}










<nav className="menu">


{

menu.map(item=>(


<Link

key={item.path}

to={item.path}

className={

location.pathname===item.path

?

"active"

:

""

}

>


<span className="icon">

{item.icon}

</span>


{item.name}


</Link>


))


}


</nav>



<LanguageSwitcher />



<button
  className="theme-toggle"
  onClick={toggleDarkMode}
  aria-label="Toggle dark mode"
>
  {darkMode ? <MdLightMode /> : <MdDarkMode />}
  {darkMode ? t("nav.lightMode") : t("nav.darkMode")}
</button>



<button

className="logout-btn"

onClick={logout}

>

{t("nav.logout")}

</button>






</aside>


)


}



export default Navbar;