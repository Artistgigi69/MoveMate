import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MdAttachMoney } from "react-icons/md";
import { useCurrency } from "../CurrencyContext";
import "./AddExpense.css";


function AddExpense() {


const { t } = useTranslation();

const { symbol } = useCurrency();

const navigate = useNavigate();



const [expense,setExpense]=useState({

title:"",
amount:"",
category:"",
date:"",
description:""

});





const handleChange=(e)=>{


setExpense({

...expense,

[e.target.name]:e.target.value

});


};







const addExpense=async(e)=>{


e.preventDefault();



try{


const token=localStorage.getItem("token");



const response=await fetch(

`${import.meta.env.VITE_API_URL}/expenses`,

{

method:"POST",

headers:{

"Content-Type":"application/json",

Authorization:token

},


body:JSON.stringify(expense)


}

);





const data=await response.json();



if(response.ok){


navigate("/expenses");


}

else{


alert(data.message);


}



}

catch(error){


console.log(error);


}



};







return(



<div className="add-expense-page">





<div className="add-expense-box">





<div className="form-header">


<h1>

<MdAttachMoney /> {t("expenses.addExpenseTitle")}

</h1>


<p>

{t("expenses.addExpenseSubtitle")}

</p>


</div>







<form onSubmit={addExpense}>


<div className="input-group">


<label>

{t("expenses.titleLabel")}

</label>


<input

name="title"

placeholder={t("expenses.titlePlaceholder")}

value={expense.title}

onChange={handleChange}

required

/>


</div>








<div className="input-group">


<label>

{t("expenses.amountLabel")}

</label>


<input

name="amount"

type="number"

placeholder={`${symbol} 0`}

value={expense.amount}

onChange={handleChange}

required

/>


</div>








<div className="input-group">


<label>

{t("expenses.categoryLabel")}

</label>



<select

name="category"

value={expense.category}

onChange={handleChange}

required

>


<option value="">

{t("expenses.chooseCategory")}

</option>


<option value="electricity">

{t("nav.electricity")}

</option>


<option value="gas">

{t("nav.gas")}

</option>


<option value="water">

{t("nav.water")}

</option>


<option value="arnona">

{t("nav.arnona")}

</option>


<option value="Utilities">

{t("expenses.categoryUtilities")}

</option>


<option value="Food">

{t("expenses.categoryFood")}

</option>


<option value="Transport">

{t("expenses.categoryTransport")}

</option>


<option value="Shopping">

{t("expenses.categoryShopping")}

</option>


<option value="Home">

{t("expenses.categoryHome")}

</option>


<option value="Other">

{t("expenses.categoryOther")}

</option>



</select>



</div>









<div className="input-group">


<label>

{t("expenses.dateLabel")}

</label>


<input

name="date"

type="date"

value={expense.date}

onChange={handleChange}

/>


</div>








<div className="input-group">


<label>

{t("expenses.descriptionLabel")}

</label>


<textarea

name="description"

placeholder={t("expenses.descriptionPlaceholder")}

value={expense.description}

onChange={handleChange}

/>



</div>







<button className="save-expense">


{t("expenses.saveExpense")}

</button>





</form>





</div>





</div>



)


}


export default AddExpense;