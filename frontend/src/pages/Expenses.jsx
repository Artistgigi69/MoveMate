import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MdAttachMoney,
  MdBarChart,
  MdCreditCard,
  MdBolt,
  MdFastfood,
  MdDirectionsCar,
  MdShoppingCart,
  MdHome,
  MdCategory
} from "react-icons/md";
import "./Expenses.css";


function Expenses() {


const { t } = useTranslation();

const [expenses,setExpenses]=useState([]);

const [loading,setLoading]=useState(true);





const getExpenses=async()=>{


try{


const token=localStorage.getItem("token");


const response=await fetch(

`${import.meta.env.VITE_API_URL}/expenses`,

{
headers:{
Authorization:token
}
}

);


const data=await response.json();


setExpenses(data);



}

catch(error){

console.log(error);

}


finally{

setLoading(false);

}


};







useEffect(()=>{

getExpenses();

},[]);








const deleteExpense=async(id)=>{


const confirmDelete=window.confirm(
t("expenses.confirmDelete")
);


if(!confirmDelete) return;



try{


const token=localStorage.getItem("token");



await fetch(

`${import.meta.env.VITE_API_URL}/expenses/${id}`,

{

method:"DELETE",

headers:{
Authorization:token
}

}

);



getExpenses();



}

catch(error){

console.log(error);

}



};









const total=expenses.reduce(

(sum,item)=>
sum+Number(item.amount),

0

);





const getIcon=(category)=>{


if(category==="Food")
return MdFastfood;


if(category==="Transport")
return MdDirectionsCar;


if(category==="Utilities")
return MdBolt;


if(category==="Shopping")
return MdShoppingCart;


if(category==="Home")
return MdHome;


return MdCategory;


};


const CATEGORY_KEYS={
Food:"categoryFood",
Transport:"categoryTransport",
Utilities:"categoryUtilities",
Shopping:"categoryShopping",
Home:"categoryHome",
Other:"categoryOther"
};


const categoryLabel=(category)=>{

const key=CATEGORY_KEYS[category];

return key ? t(`expenses.${key}`) : category;

};







if(loading){

return (

<div className="loading">

{t("expenses.loadingExpenses")}

</div>

)

}






return(



<div className="expenses-page">






<div className="expenses-header">


<div>

<h1>

<MdAttachMoney /> {t("expenses.title")}

</h1>


<p>

{t("expenses.subtitle")}

</p>


</div>





<Link

className="add-expense"

to="/add-expense"

>

{t("expenses.addExpense")}

</Link>



</div>









<div className="expense-stats">



<div className="expense-total">


<p>

{t("expenses.totalExpenses")}

</p>


<h1>

${total}

</h1>


<span>

{t("expenses.thisMonth")}

</span>


</div>





<div className="small-stat">


<h3>

<MdBarChart />

</h3>


<p>

{t("expenses.transactions")}

</p>


<h2>

{expenses.length}

</h2>


</div>






<div className="small-stat">


<h3>

<MdCreditCard />

</h3>


<p>

{t("expenses.average")}

</p>


<h2>

${

expenses.length

?

Math.round(total / expenses.length)

:

0

}

</h2>


</div>



</div>









<div className="expenses-grid">



{

expenses.length===0 ?



<div className="empty-box">

<h2>

{t("expenses.noExpensesYet")}

</h2>


<p>

{t("expenses.startAdding")}

</p>


</div>



:

expenses.map((expense)=>(



<div

className="expense-card"

key={expense._id}

>




<div className="expense-top">


<div className="expense-icon">

{
(() => {
  const CategoryIcon = getIcon(expense.category);
  return <CategoryIcon />;
})()
}

</div>



<div>

<h2>

{expense.title}

</h2>


<p>

{categoryLabel(expense.category)}

</p>


</div>



</div>







<div className="amount">

${expense.amount}

</div>







<p className="description">

{expense.description || t("expenses.noDescription")}

</p>








<button

onClick={()=>deleteExpense(expense._id)}

>

{t("common.delete")}

</button>





</div>



))


}



</div>






</div>


)



}


export default Expenses;