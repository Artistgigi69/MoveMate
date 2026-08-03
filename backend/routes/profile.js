const express = require("express");

const bcrypt = require("bcrypt");

const { authenticator } = require("otplib");

const qrcode = require("qrcode");

const User = require("../models/User");

const verifyToken = require("../middleware/auth");

const upload = require("../middleware/upload");


const router = express.Router();




// ================= GET PROFILE =================

router.get("/", verifyToken, async (req, res) => {

  try {


    const user = await User.findById(req.userId)
      .select("-password -twoFactorSecret");


    res.json(user);


  } catch (error) {


    console.log(error);


    res.status(500).json({

      message: error.message

    });


  }

});







// ================= UPLOAD AVATAR =================

router.post(
  "/upload-avatar",
  verifyToken,
  upload.single("avatar"),

  async (req, res) => {


    try {


      if (!req.file) {

        return res.status(400).json({

          message: "No file uploaded"

        });

      }



      const user = await User.findById(
        req.userId
      );



      if (!user) {

        return res.status(404).json({

          message: "User not found"

        });

      }



      user.avatar = req.file.filename;



      await user.save();



      res.json({

        message: "Avatar updated",

        avatar: user.avatar

      });



    } catch (error) {


      console.log(
        "UPLOAD AVATAR ERROR:",
        error
      );


      res.status(500).json({

        message: error.message

      });


    }


  }

);





// ================= UPDATE PROFILE =================

router.put("/update", verifyToken, async (req, res) => {

  try {

    const { username, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, email },
      { new: true }
    ).select("-password -twoFactorSecret");

    if (!user) {

      return res.status(404).json({
        message: "User not found"
      });

    }

    res.json(user);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

});




// ================= CHANGE PASSWORD =================

router.put("/change-password", verifyToken, async (req, res) => {

  try {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {

      return res.status(400).json({
        message: "Current and new password are required"
      });

    }

    if (newPassword.length < 6) {

      return res.status(400).json({
        message: "New password must be at least 6 characters"
      });

    }

    const user = await User.findById(req.userId);

    if (!user) {

      return res.status(404).json({
        message: "User not found"
      });

    }

    const valid = await bcrypt.compare(currentPassword, user.password);

    if (!valid) {

      return res.status(400).json({
        message: "Current password is incorrect"
      });

    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({
      message: "Password updated"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

});




// ================= 2FA: START SETUP =================

router.post("/2fa/setup", verifyToken, async (req, res) => {

  try {

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        message: "Two-factor authentication is already enabled"
      });
    }

    const secret = authenticator.generateSecret();

    user.twoFactorSecret = secret;
    await user.save();

    const otpauth = authenticator.keyuri(user.email, "MoveMate", secret);

    const qrCode = await qrcode.toDataURL(otpauth);

    res.json({
      qrCode,
      secret
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

});




// ================= 2FA: CONFIRM SETUP =================

router.post("/2fa/verify-setup", verifyToken, async (req, res) => {

  try {

    const { code } = req.body;

    const user = await User.findById(req.userId);

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({
        message: "Start 2FA setup first"
      });
    }

    const valid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });

    if (!valid) {
      return res.status(400).json({
        message: "Invalid code, please try again"
      });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({
      message: "Two-factor authentication enabled",
      twoFactorEnabled: true
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

});




// ================= 2FA: DISABLE =================

router.post("/2fa/disable", verifyToken, async (req, res) => {

  try {

    const { code } = req.body;

    const user = await User.findById(req.userId);

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        message: "Two-factor authentication is not enabled"
      });
    }

    const valid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });

    if (!valid) {
      return res.status(400).json({
        message: "Invalid code"
      });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = "";
    await user.save();

    res.json({
      message: "Two-factor authentication disabled",
      twoFactorEnabled: false
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

});




// ================= REFERRALS =================

router.get("/referrals", verifyToken, async (req, res) => {

  try {

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const referred = await User.find({ referredBy: req.userId })
      .select("username createdAt")
      .sort({ createdAt: -1 });

    res.json({
      referralCode: user.referralCode,
      referredCount: referred.length,
      referred
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

});




module.exports = router;