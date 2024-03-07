import mongoose from "mongoose";
import jsonwebtoken from "jsonwebtoken";
import bycypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      lowercase: true,
      index: true, // that helps to search in DB
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    fullName: {
      type: String,
      required: true,
    },
    avatar: {
      // This is basedon cloudnary
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // pre validation for existing schema before save.
  if (this.isModified == "password") {
    this.password = await bycypt.hash(this.password, 10);
    next();
  } else {
    return next();
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  // That will compare the password against our hashed password
  // That will return true if the password matches or flase if not matched.
  return await bycypt.compare(password, this.password);
};

// Genrating Acess token method
userSchema.methods.genrateAcessToken = function () {
  return jsonwebtoken.sign(
    {
      // payload
      _id: this._id,
      userName: this.userName,
      email: this.email,
      fullName: this.fullName,
    },
    //   secretOrPrivateKey token
    process.env.ACCESS_TOKEN_SECRET,
    // Expire token
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Genrating Refresh token method
userSchema.methods.refreshAcessToken = function () {
  return jsonwebtoken.sign(
    {
      // payload
      _id: this._id,
    },

    //   secretOrPrivateKey token
    process.env.REFRESH_TOKEN_SECRET,

    // Expire token
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
