const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth");

const Transfer = require("../models/Transfer");
const Expense = require("../models/Expense");



router.get("/", verifyToken, async (req,res)=>{


try{


// TRANSFERS

const transfers = await Transfer.find({
userId:req.user.id
});


let totalServices = 0;


transfers.forEach((transfer)=>{

if(transfer.services){

totalServices += transfer.services.length;

}

});



const recentTransfers = transfers
.slice(-5)
.reverse();




// EXPENSES

const expenses = await Expense.find({
userId:req.user.id
});



let total = 0;


let categories = {};



expenses.forEach(expense=>{


total += expense.amount;



if(categories[expense.category]){

categories[expense.category] += expense.amount;

}
else{

categories[expense.category] = expense.amount;

}


});





const categoryData = Object.keys(categories).map(category=>({

name:category,

value:categories[category]

}));






const monthly={};



expenses.forEach(expense=>{


const month =
new Date(expense.createdAt)
.toLocaleString(
"en-US",
{
month:"short"
}
);



if(monthly[month]){

monthly[month]+=expense.amount;

}
else{

monthly[month]=expense.amount;

}


});



const monthlyData = Object.keys(monthly).map(month=>({

month,

amount:monthly[month]

}));



const recentExpenses = [...expenses]
.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
.slice(0,5);







res.json({

total,

categoryData,

monthlyData,


totalTransfers:transfers.length,

totalServices,

recentTransfers,

recentExpenses


});





}
catch(error){

console.log("🔥 DASHBOARD ERROR:");
console.log(error);

res.status(500).json({
message:error.message
});

}


});



module.exports = router;