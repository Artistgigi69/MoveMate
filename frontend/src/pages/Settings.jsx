import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { MdSettings, MdNotifications, MdLock, MdCameraAlt, MdShieldMoon } from "react-icons/md";
import { getSubscriptionStatus, subscribeToPush, unsubscribeFromPush } from "../push";
import "./Settings.css";


function Settings(){


const { t } = useTranslation();

const [user,setUser]=useState(null);


const [form,setForm]=useState({

username:"",
email:""

});


const [notifications,setNotifications]=useState(true);


const [pushEnabled,setPushEnabled]=useState(false);
const [pushBusy,setPushBusy]=useState(false);


useEffect(()=>{

getSubscriptionStatus().then(setPushEnabled).catch(()=>{});

},[]);


const togglePush=async()=>{

setPushBusy(true);

try{

if(pushEnabled){

await unsubscribeFromPush();
setPushEnabled(false);

}
else{

await subscribeToPush();
setPushEnabled(true);
toast.success(t("settings.pushEnabled"));

}

}
catch(error){

console.log(error);
toast.error(error.message || t("auth.serverError"));

}
finally{

setPushBusy(false);

}

};


const [showPasswordModal,setShowPasswordModal]=useState(false);

const [passwordForm,setPasswordForm]=useState({

currentPassword:"",
newPassword:"",
confirmPassword:""

});


const handlePasswordChange=(e)=>{

setPasswordForm({

...passwordForm,

[e.target.name]:e.target.value

});

};


const changePassword=async(e)=>{

e.preventDefault();

if(passwordForm.newPassword !== passwordForm.confirmPassword){

toast.error(t("settings.passwordsDontMatch"));

return;

}

try{

const token=localStorage.getItem("token");

const res=await fetch(

`${import.meta.env.VITE_API_URL}/profile/change-password`,

{

method:"PUT",

headers:{

"Content-Type":"application/json",

Authorization:token

},

body:JSON.stringify({

currentPassword:passwordForm.currentPassword,

newPassword:passwordForm.newPassword

})

}

);

const data=await res.json();

if(!res.ok){

toast.error(data.message || t("settings.couldNotChangePassword"));

return;

}

toast.success(t("settings.passwordUpdated"));

setShowPasswordModal(false);

setPasswordForm({

currentPassword:"",
newPassword:"",
confirmPassword:""

});

}

catch(error){

console.log(error);

toast.error(t("auth.serverError"));

}

};




// ================= 2FA =================


const [show2FASetup,setShow2FASetup]=useState(false);
const [show2FADisable,setShow2FADisable]=useState(false);

const [qrCode,setQrCode]=useState("");
const [manualSecret,setManualSecret]=useState("");
const [setupCode,setSetupCode]=useState("");
const [disableCode,setDisableCode]=useState("");


const startEnable2FA=async()=>{

const token=localStorage.getItem("token");

try{

const res=await fetch(

`${import.meta.env.VITE_API_URL}/profile/2fa/setup`,

{
method:"POST",
headers:{ Authorization:token }
}

);

const data=await res.json();

if(!res.ok){
toast.error(data.message || t("settings.couldNotStart2FA"));
return;
}

setQrCode(data.qrCode);
setManualSecret(data.secret);
setShow2FASetup(true);

}
catch(error){
console.log(error);
toast.error(t("auth.serverError"));
}

};


const confirmEnable2FA=async(e)=>{

e.preventDefault();

const token=localStorage.getItem("token");

try{

const res=await fetch(

`${import.meta.env.VITE_API_URL}/profile/2fa/verify-setup`,

{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:token
},
body:JSON.stringify({ code:setupCode })
}

);

const data=await res.json();

if(!res.ok){
toast.error(data.message || t("auth.invalidCode"));
return;
}

toast.success(t("settings.twoFAEnabledToast"));

setUser(prev=>({ ...prev, twoFactorEnabled:true }));
setShow2FASetup(false);
setSetupCode("");
setQrCode("");
setManualSecret("");

}
catch(error){
console.log(error);
toast.error(t("auth.serverError"));
}

};


const disable2FA=async(e)=>{

e.preventDefault();

const token=localStorage.getItem("token");

try{

const res=await fetch(

`${import.meta.env.VITE_API_URL}/profile/2fa/disable`,

{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:token
},
body:JSON.stringify({ code:disableCode })
}

);

const data=await res.json();

if(!res.ok){
toast.error(data.message || t("auth.invalidCode"));
return;
}

toast.success(t("settings.twoFADisabledToast"));

setUser(prev=>({ ...prev, twoFactorEnabled:false }));
setShow2FADisable(false);
setDisableCode("");

}
catch(error){
console.log(error);
toast.error(t("auth.serverError"));
}

};




// ================= LOAD USER =================


useEffect(()=>{


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


setForm({

username:data.username,

email:data.email

});


});


},[]);






// ================= CHANGE INPUT =================


const handleChange=(e)=>{


setForm({

...form,

[e.target.name]:e.target.value

});


};








// ================= UPLOAD PHOTO =================


const uploadAvatar = async(e)=>{


const file=e.target.files[0];


if(!file) return;



const formData=new FormData();


formData.append(
"avatar",
file
);



const token=localStorage.getItem("token");



try{


const res=await fetch(

`${import.meta.env.VITE_API_URL}/profile/upload-avatar`,

{

method:"POST",

headers:{
Authorization:token
},

body:formData

}

);



const data=await res.json();



setUser({

...user,

avatar:data.avatar

});



// обновляем Sidebar

window.dispatchEvent(
new Event("profileUpdated")
);



}


catch(error){

console.log(error);

}



};








// ================= SAVE PROFILE =================


const saveProfile=async()=>{


const token=localStorage.getItem("token");


const res=await fetch(

`${import.meta.env.VITE_API_URL}/profile/update`,

{

method:"PUT",

headers:{


"Content-Type":"application/json",

Authorization:token


},


body:JSON.stringify(form)


}

);



const data=await res.json();


setUser(data);



alert(t("settings.profileUpdated"));


};







if(!user){

return <h2>{t("common.loading")}</h2>

}







return(



<div className="settings-page">





<div className="settings-card">





<h1>
<MdSettings /> {t("settings.title")}
</h1>



<p className="subtitle">

{t("settings.subtitle")}

</p>








<div className="avatar-section">



<label>

<img

src={

user.avatar

?

`${import.meta.env.VITE_API_URL}/uploads/${user.avatar}`

:

"https://i.pravatar.cc/150"

}

/>


<div className="camera-icon">

<MdCameraAlt />

</div>


<input

type="file"

accept="image/*"

onChange={uploadAvatar}

/>


</label>



<p>
{t("settings.clickPhotoToChange")}
</p>


</div>









<div className="form-group">


<label>
{t("settings.username")}
</label>


<input

name="username"

value={form.username}

onChange={handleChange}

/>


</div>








<div className="form-group">


<label>
{t("settings.emailLabel")}
</label>


<input

name="email"

value={form.email}

onChange={handleChange}

/>


</div>









<div className="setting-row">


<div>

<h3>
<MdNotifications /> {t("settings.notifications")}
</h3>


<p>
{t("settings.receiveUpdates")}
</p>


</div>




<label className="switch">


<input

type="checkbox"

checked={notifications}

onChange={()=>setNotifications(!notifications)}

/>


<span></span>


</label>



</div>




<div className="setting-row">


<div>

<h3>
<MdNotifications /> {t("settings.pushTitle")}
</h3>


<p>
{t("settings.pushHint")}
</p>


</div>



<label className="switch">


<input

type="checkbox"

checked={pushEnabled}

disabled={pushBusy}

onChange={togglePush}

/>


<span></span>


</label>



</div>








<div className="setting-row">


<div>

<h3>
<MdLock /> {t("profile.security")}
</h3>


<p>
{t("settings.accountProtected")}
</p>


</div>



<button
  className="security-btn"
  onClick={() => setShowPasswordModal(true)}
>

{t("settings.changePassword")}

</button>



</div>



<div className="setting-row">


<div>

<h3>
<MdShieldMoon /> {t("settings.twoFactorAuth")}
</h3>


<p>
{
  user.twoFactorEnabled
    ? t("settings.twoFAEnabledHint")
    : t("settings.twoFADisabledHint")
}
</p>


</div>



{
  user.twoFactorEnabled ? (
    <button
      className="security-btn"
      onClick={() => setShow2FADisable(true)}
    >
      {t("settings.disable")}
    </button>
  ) : (
    <button
      className="security-btn"
      onClick={startEnable2FA}
    >
      {t("settings.enable")}
    </button>
  )
}


</div>









<button

className="save-btn"

onClick={saveProfile}

>

{t("settings.saveChanges")}

</button>


</div>


{
showPasswordModal && (

<div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>

<div className="modal-box" onClick={(e) => e.stopPropagation()}>

<h2>{t("settings.changePassword")}</h2>

<form onSubmit={changePassword}>

<div className="form-group">
<label>{t("settings.currentPassword")}</label>
<input
  type="password"
  name="currentPassword"
  value={passwordForm.currentPassword}
  onChange={handlePasswordChange}
  required
/>
</div>

<div className="form-group">
<label>{t("settings.newPassword")}</label>
<input
  type="password"
  name="newPassword"
  value={passwordForm.newPassword}
  onChange={handlePasswordChange}
  minLength={6}
  required
/>
</div>

<div className="form-group">
<label>{t("settings.confirmNewPassword")}</label>
<input
  type="password"
  name="confirmPassword"
  value={passwordForm.confirmPassword}
  onChange={handlePasswordChange}
  minLength={6}
  required
/>
</div>

<div className="modal-actions">
<button
  type="button"
  className="modal-cancel"
  onClick={() => setShowPasswordModal(false)}
>
  {t("common.cancel")}
</button>

<button type="submit" className="security-btn">
  {t("settings.updatePassword")}
</button>
</div>

</form>

</div>

</div>

)
}


{
show2FASetup && (

<div className="modal-overlay" onClick={() => setShow2FASetup(false)}>

<div className="modal-box" onClick={(e) => e.stopPropagation()}>

<h2>{t("settings.setupTitle")}</h2>

<p className="twofa-hint">
  {t("settings.setupHint")}
</p>

{
  qrCode && (
    <img className="twofa-qr" src={qrCode} alt="2FA QR code" />
  )
}

{
  manualSecret && (
    <p className="twofa-secret">
      {t("settings.cantScan")} <code>{manualSecret}</code>
    </p>
  )
}

<form onSubmit={confirmEnable2FA}>

  <div className="form-group">
    <label>{t("settings.sixDigitCode")}</label>
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      placeholder="123456"
      value={setupCode}
      onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
      required
    />
  </div>

  <div className="modal-actions">
    <button
      type="button"
      className="modal-cancel"
      onClick={() => setShow2FASetup(false)}
    >
      {t("common.cancel")}
    </button>

    <button type="submit" className="security-btn">
      {t("common.confirm")}
    </button>
  </div>

</form>

</div>

</div>

)
}


{
show2FADisable && (

<div className="modal-overlay" onClick={() => setShow2FADisable(false)}>

<div className="modal-box" onClick={(e) => e.stopPropagation()}>

<h2>{t("settings.disableTitle")}</h2>

<p className="twofa-hint">
  {t("settings.disableHint")}
</p>

<form onSubmit={disable2FA}>

  <div className="form-group">
    <label>{t("settings.sixDigitCode")}</label>
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      placeholder="123456"
      value={disableCode}
      onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
      required
    />
  </div>

  <div className="modal-actions">
    <button
      type="button"
      className="modal-cancel"
      onClick={() => setShow2FADisable(false)}
    >
      {t("common.cancel")}
    </button>

    <button type="submit" className="security-btn">
      {t("settings.disable")}
    </button>
  </div>

</form>

</div>

</div>

)
}


</div>


)



}


export default Settings;