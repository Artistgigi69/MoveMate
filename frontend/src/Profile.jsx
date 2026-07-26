import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import Navbar from "./Navbar";

function Profile() {

  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const [oldAddress, setOldAddress] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [moveDate, setMoveDate] = useState("");

  const [services, setServices] = useState([]);

  const [transfers, setTransfers] = useState([]);

  const navigate = useNavigate();



  // GET PROFILE
  const getProfile = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/profile`,
        {
          headers:{
            Authorization: token
          }
        }
      );


      const data = await response.json();

      console.log("PROFILE:", data);

      setUser(data);


    } catch(error){

      console.log(
        "PROFILE ERROR:",
        error
      );

    }

  };





  // GET TRANSFERS
  const getTransfers = async () => {

    try {

      const token = localStorage.getItem("token");


      const response = await fetch(
        "http://localhost:5000/transfers",
        {
          headers:{
            Authorization: token
          }
        }
      );


      const data = await response.json();


      console.log(
        "TRANSFERS:",
        data
      );


      setTransfers(data);


    } catch(error){

      console.log(
        "TRANSFERS ERROR:",
        error
      );

    }

  };





  useEffect(()=>{

    getProfile();

    getTransfers();

  },[]);







  // LOGOUT
  const logout = () => {

    localStorage.removeItem("token");

    navigate("/login");

  };








  // UPLOAD AVATAR
  const uploadAvatar = async () => {


    if(!avatar){

      alert("Select file first");

      return;

    }


    try {


      const formData = new FormData();


      formData.append(
        "avatar",
        avatar
      );


      formData.append(
        "userId",
        user._id
      );



      const response = await fetch(
        "http://localhost:5000/upload-avatar",
        {
          method:"POST",
          body:formData
        }
      );



      const data = await response.json();


      console.log(
        "UPLOAD:",
        data
      );


      window.location.reload();



    } catch(error){

      console.log(
        "UPLOAD ERROR:",
        error
      );

    }


  };








  // SERVICES CHECKBOX
  const changeService = (service)=>{


    if(services.includes(service)){


      setServices(
        services.filter(
          item=>item!==service
        )
      );


    }else{


      setServices([
        ...services,
        service
      ]);


    }


  };









  // CREATE TRANSFER
  const createTransfer = async()=>{


    try{


      const token = localStorage.getItem("token");



      const response = await fetch(
        "http://localhost:5000/transfers",
        {

          method:"POST",


          headers:{

            "Content-Type":"application/json",

            Authorization:token

          },


          body:JSON.stringify({

            oldAddress,

            newAddress,

            moveDate,

            services

          })

        }

      );



      const data = await response.json();


      console.log(
        "TRANSFER:",
        data
      );


      alert(
        "Transfer created!"
      );



      getTransfers();



      setOldAddress("");

      setNewAddress("");

      setMoveDate("");

      setServices([]);



    }catch(error){


      console.log(
        "TRANSFER ERROR:",
        error
      );


    }


  };









  // DELETE TRANSFER
  const deleteTransfer = async(id)=>{


    try{


      const token = localStorage.getItem("token");


      const response = await fetch(

        `http://localhost:5000/transfers/${id}`,

        {
          method:"DELETE",

          headers:{
            Authorization:token
          }

        }

      );



      const data = await response.json();



      console.log(
        "DELETE:",
        data
      );



      getTransfers();



    }catch(error){


      console.log(
        "DELETE ERROR:",
        error
      );


    }


  };


// UPDATE STATUS
const updateStatus = async (transferId, serviceIndex, newStatus) => {

  try {

    const token = localStorage.getItem("token");


    const response = await fetch(
      `http://localhost:5000/transfers/${transferId}/status`,
      {
        method:"PUT",

        headers:{
          "Content-Type":"application/json",
          Authorization: token
        },

        body:JSON.stringify({

          serviceIndex,

          status:newStatus

        })

      }
    );


    const data = await response.json();


    console.log(
      "STATUS UPDATE:",
      data
    );


    getTransfers();


  } catch(error){

    console.log(
      "STATUS ERROR:",
      error
    );

  }

};






  return (

<>
<Navbar />


<div className="container">


<h1>
Profile
</h1>




{
user &&

<div className="profile-card">



{
user.avatar ?


<img

src={`http://localhost:5000/uploads/${user.avatar}`}

className="avatar-img"

alt="avatar"

/>


:


<div className="avatar">

{
user.username
?
user.username[0].toUpperCase()
:
"U"
}

</div>


}






<h2>
{user.username}
</h2>


<p>
{user.email}
</p>





<input

type="file"

onChange={
(e)=>setAvatar(e.target.files[0])
}

/>


<button onClick={uploadAvatar}>
Upload Avatar
</button>







<h3>
Create Transfer
</h3>




<input

placeholder="Old address"

value={oldAddress}

onChange={
(e)=>setOldAddress(e.target.value)
}

/>



<input

placeholder="New address"

value={newAddress}

onChange={
(e)=>setNewAddress(e.target.value)
}

/>



<input

type="date"

value={moveDate}

onChange={
(e)=>setMoveDate(e.target.value)
}

/>






<div>


{
["electricity","gas","water","arnona"]
.map(service=>(


<label key={service}>


<input

type="checkbox"

checked={
services.includes(service)
}

onChange={()=>
changeService(service)
}

/>


{service}


<br/>


</label>


))

}


</div>





<button onClick={createTransfer}>
Create Transfer
</button>








<h3>
My Transfers
</h3>





{
transfers.map(item=>(


<div

key={item._id}

className="transfer-card"

>


<p>
From: {item.oldAddress}
</p>


<p>
To: {item.newAddress}
</p>


<p>
Date: {item.moveDate}
</p>





<h4>
Services:
</h4>



{
item.services.map((s,index)=>(

<div key={index}>

<p>
{s.name.toUpperCase()}
</p>

<span>
Status: {s.status}
</span>

{
s.status === "Pending" && (

<button
onClick={() =>
updateStatus(
item._id,
index,
"Processing"
)
}
>
Start Process
</button>

)
}


{
s.status === "Processing" && (

<button
onClick={() =>
updateStatus(
item._id,
index,
"Completed"
)
}
>
Complete
</button>

)
}


{
s.status === "Completed" && (

<span>
✅ Completed
</span>

)
}

</div>

))

}





<button

onClick={()=>
deleteTransfer(item._id)
}

>

Delete Transfer

</button>




</div>


))

}






<span className="status">
Account Active
</span>




</div>

}




<button onClick={logout}>
Logout
</button>



</div>


</>

);


}


export default Profile;