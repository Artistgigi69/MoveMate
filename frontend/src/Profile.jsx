import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MdLocalShipping,
  MdBolt,
  MdCheckCircle,
  MdHome,
  MdCreditCard,
  MdCameraAlt
} from "react-icons/md";
import "./Profile.css";


function Profile(){


const navigate = useNavigate();

const { t } = useTranslation();

const [user,setUser] = useState(null);

const [dashboard,setDashboard] = useState(null);





// ================= UPLOAD AVATAR =================


const uploadAvatar = async(e)=>{


const file = e.target.files[0];


if(!file) return;



const formData = new FormData();


formData.append(
"avatar",
file
);



try{


const token = localStorage.getItem("token");



const res = await fetch(

`${import.meta.env.VITE_API_URL}/profile/upload-avatar`,

{

method:"POST",

headers:{

Authorization:token

},

body:formData

}

);



const data = await res.json();

if(!data.avatar){
  return;
}


setUser(prev=>({

...prev,

avatar:data.avatar

}));





// обновляем Sidebar

window.dispatchEvent(
new Event("userUpdated")
);



}

catch(error){

console.log(
"UPLOAD ERROR:",
error
);


}



};








// ================= LOAD DATA =================



useEffect(()=>{


const token = localStorage.getItem("token");




const loadProfile = async()=>{


try{


const res = await fetch(

`${import.meta.env.VITE_API_URL}/profile`,

{

headers:{

Authorization:token

}

}

);



const data = await res.json();


setUser(data);



}

catch(error){

console.log(error);

}



};







const loadDashboard = async()=>{


try{


const res = await fetch(

`${import.meta.env.VITE_API_URL}/dashboard`,

{

headers:{

Authorization:token

}

}

);



const data = await res.json();


setDashboard(data);



}

catch(error){

console.log(error);

}


};





loadProfile();

loadDashboard();



},[]);








if(!user){


return(

<div className="loading">

{t("common.loading")}

</div>

)


}









return(


<div className="dashboard">





<div className="header">


<div>


<h1>

{t("dashboard.greeting", { name: user.username })}

</h1>



<p>

{t("dashboard.subtitle")}

</p>


</div>




<button
  className="new-btn"
  onClick={() => navigate("/create")}
>

{t("dashboard.newTransfer")}

</button>



</div>









<div className="stats">





<div className="card blue">


<div className="icon">

<MdLocalShipping />

</div>


<div>

<p>

{t("profile.totalTransfers")}

</p>


<h2>

{dashboard?.totalTransfers || 0}

</h2>


</div>


</div>








<div className="card purple">


<div className="icon">

<MdBolt />

</div>


<div>

<p>

{t("profile.activeServices")}

</p>


<h2>

{dashboard?.totalServices || 0}

</h2>


</div>


</div>








<div className="card green">


<div className="icon">

<MdCheckCircle />

</div>


<div>

<p>

{t("profile.status")}

</p>


<h2>

{t("profile.active")}

</h2>


</div>


</div>





</div>









<div className="content">






<div className="activity">



<h2>

{t("dashboard.recentActivity")}

</h2>





{

dashboard?.lastTransfer ? (


<div className="item">


<MdHome />


<p>

{t("profile.moveFrom", { address: dashboard.lastTransfer.oldAddress })}

</p>


<span>

{t("profile.recent")}

</span>



</div>



)

:

(

<p>

{t("profile.noTransfersYet")}

</p>


)

}







<div className="item">

<MdCreditCard />

<p>

{t("profile.paymentMethodAdded")}

</p>


<span>

{t("profile.yesterday")}

</span>


</div>






<div className="item">

<MdBolt />

<p>

{t("profile.electricityServiceUpdated")}

</p>


<span>

{t("profile.twoDaysAgo")}

</span>


</div>






</div>









<div className="profile-card">






<label className="big-avatar avatar-upload">





<img

src={

user.avatar

?

`${import.meta.env.VITE_API_URL}/uploads/${user.avatar}`

:

"https://i.pravatar.cc/150"

}

/>





<div className="camera">

<MdCameraAlt />

</div>





<input

type="file"

accept="image/*"

onChange={uploadAvatar}

/>




</label>







<h2>

{user.username}

</h2>




<p>

{user.email}

</p>







<div className="line"></div>








<div className="info">


<span>

{t("profile.account")}

</span>


<b>

{user.plan === "premium" ? t("profile.premium") : t("profile.free")}

</b>


</div>









<div className="info">


<span>

{t("profile.security")}

</span>


<b>

{t("profile.protected")}

</b>


</div>






</div>







</div>







</div>


)


}



export default Profile;