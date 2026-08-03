import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";
import { MdCreditCard, MdStar, MdLock } from "react-icons/md";
import "./Cards.css";


function Cards() {


  const { t } = useTranslation();

  const [cards, setCards] = useState([]);
  const [addingCard, setAddingCard] = useState(false);



  const getCards = async () => {

    const token = localStorage.getItem("token");


    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/cards`,
      {
        headers:{
          Authorization: token
        }
      }
    );


    const data = await res.json();

    setCards(data);

  };





  useEffect(()=>{

    getCards();

  },[]);






  const addCard = async()=>{

    setAddingCard(true);

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/cardcom/add-card`,
        {
          method: "POST",
          headers: { Authorization: token }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || t("cards.gatewayError"));
        setAddingCard(false);
        return;
      }

      // Hand off to Cardcom's hosted page — card details are entered there,
      // never on this site.
      window.location.href = data.url;

    } catch (error) {
      console.log(error);
      toast.error(t("auth.serverError"));
      setAddingCard(false);
    }

  };


const setDefault = async(id)=>{

  const token = localStorage.getItem("token");


  await fetch(
    `${import.meta.env.VITE_API_URL}/cards/${id}/default`,
    {
      method:"PUT",
      headers:{
        Authorization:token
      }
    }
  );


  getCards();

};



  const deleteCard = async(id)=>{


    const token = localStorage.getItem("token");


    await fetch(
      `${import.meta.env.VITE_API_URL}/cards/${id}`,
      {
        method:"DELETE",
        headers:{
          Authorization:token
        }
      }
    );


    getCards();


  };







  return (

    <div className="cards-page">


      <h1>
        <MdCreditCard /> {t("dashboard.paymentMethods")}
      </h1>



      <div className="cards-container">


        {
          cards.map(card=>(


            <div className={`bank-card ${card.brand.toLowerCase()}`} key={card._id}>


              <div className="card-brand">

{
  card.brand === "Visa"
  ? <><FaCcVisa /> VISA</>
  : <><FaCcMastercard /> Mastercard</>
}

</div>


              <h2>
                •••• •••• •••• {card.last4}
              </h2>



              <div className="card-info">

                <span>
                  {card.cardHolder}
                </span>


                <span>
                  {card.expiry}
                </span>

              </div>



              {
 card.isDefault && (
   <div className="primary">
     <MdStar /> {t("cards.primary")}
   </div>
 )
}


<button
 className="secondary-btn"
 onClick={()=>setDefault(card._id)}
>
 <MdStar /> {t("cards.setPrimary")}
</button>


<button
 className="danger-btn"
 onClick={()=>deleteCard(card._id)}
>
 {t("cards.remove")}
</button>



            </div>


          ))
        }


      </div>





      <div className="add-card">


        <h2>
          {t("cards.addNewCard")}
        </h2>

        <p className="add-card-hint">
          <MdLock /> {t("cards.hostedHint")}
        </p>

        <button
          className="cardcom-btn"
          onClick={addCard}
          disabled={addingCard}
        >
          {addingCard ? t("common.loading") : t("cards.addCard")}
        </button>


      </div>



    </div>

  );

}


export default Cards;