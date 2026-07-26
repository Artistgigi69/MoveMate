import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
function EditTransfer() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [transfer, setTransfer] = useState({
    title: "",
    from: "",
    to: "",
    amount: ""
  });

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const getTransfer = async () => {

      try {

        const response = await fetch(
          `http://localhost:5000/transfers/${id}`
        );

        const data = await response.json();

        setTransfer(data);
        setLoading(false);

      } catch (error) {

        console.log(error);

      }

    };


    getTransfer();

  }, [id]);


  const handleChange = (e) => {

    setTransfer({
      ...transfer,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();


    try {

      await fetch(
  `http://localhost:5000/transfers/${id}`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(transfer)
  }
);

toast.success("Transfer updated!");

navigate("/transfers");


    } catch (error) {

      console.log(error);

    }

  };


  if (loading) {
    return <h2>Loading...</h2>;
  }


  return (

    <div className="container">

      <h1>Edit Transfer</h1>


      <form onSubmit={handleSubmit}>


        <input
          type="text"
          name="title"
          value={transfer.title}
          onChange={handleChange}
          placeholder="Title"
        />


        <input
          type="text"
          name="from"
          value={transfer.from}
          onChange={handleChange}
          placeholder="From"
        />


        <input
          type="text"
          name="to"
          value={transfer.to}
          onChange={handleChange}
          placeholder="To"
        />


        <input
          type="number"
          name="amount"
          value={transfer.amount}
          onChange={handleChange}
          placeholder="Amount"
        />


        <button type="submit">
          Save Changes
        </button>


      </form>


    </div>

  );

}


export default EditTransfer;