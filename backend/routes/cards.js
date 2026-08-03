const express = require("express");
const Card = require("../models/Card");
const verifyToken = require("../middleware/auth");

const router = express.Router();


// Get cards

router.get("/", verifyToken, async(req,res)=>{

  try{

    const cards = await Card.find({
      userId:req.userId
    });

    res.json(cards);


  }catch(error){

    res.status(500).json({
      message:error.message
    });

  }

});




// Cards are created exclusively via the Cardcom hosted-tokenization flow
// (see routes/payments.js) — this backend never receives raw card numbers,
// so there is no direct "create card" endpoint here anymore.





// Delete card

router.delete("/:id", verifyToken, async(req,res)=>{


  await Card.findByIdAndDelete(req.params.id);


  res.json({
    message:"Card deleted"
  });


});

router.put("/:id/default", verifyToken, async(req,res)=>{

  try {


    // убрать default у всех карт пользователя

    await Card.updateMany(
      {
        userId:req.userId
      },
      {
        isDefault:false
      }
    );


    // сделать выбранную основной

    const card = await Card.findOneAndUpdate(
      {
        _id:req.params.id,
        userId:req.userId
      },
      {
        isDefault:true
      },
      {
        new:true
      }
    );


    res.json(card);


  } catch(error){

    res.status(500).json({
      message:error.message
    });

  }

});

module.exports = router;