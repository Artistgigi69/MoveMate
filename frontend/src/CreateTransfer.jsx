import { useState } from "react";
import Navbar from "./Navbar";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function CreateTransfer() {
const navigate = useNavigate();
  const [oldAddress, setOldAddress] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [services, setServices] = useState([]);



  const changeService = (service)=>{

    if(services.includes(service)){

      setServices(
        services.filter(item=>item!==service)
      );

    } else {

      setServices([
        ...services,
        service
      ]);

    }

  };



  const createTransfer = async ()=>{

    try{

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/transfers`,
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

      console.log("CREATE:", data);

      toast.success("Transfer created!");

      navigate("/transfers");

      setOldAddress("");
      setNewAddress("");
      setMoveDate("");
      setServices([]);

    }catch(error){
toast.error("Something went wrong!");
      console.log(error);

    }

  };



  return (

    <>
      <Navbar />

      <div className="container">

        <h1>Create Transfer</h1>

        <input
          placeholder="Old address"
          value={oldAddress}
          onChange={(e)=>setOldAddress(e.target.value)}
        />

        <input
          placeholder="New address"
          value={newAddress}
          onChange={(e)=>setNewAddress(e.target.value)}
        />

        <input
          type="date"
          value={moveDate}
          onChange={(e)=>setMoveDate(e.target.value)}
        />

        <div>
          {
            ["electricity","gas","water","arnona"]
            .map(service=>(
              <label key={service}>

                <input
                  type="checkbox"
                  checked={services.includes(service)}
                  onChange={()=>changeService(service)}
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

      </div>
    </>
  );
}

export default CreateTransfer;