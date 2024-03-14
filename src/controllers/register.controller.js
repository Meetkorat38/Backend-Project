import asynchandler from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const register = asynchandler(async (req, res) => {
  /*  Steps for creating a new user :-

    get user details from frontend
    validation - not empty
    check if user already exists: (check with :- username, email)
    check for images, check for avatar
    upload them to cloudinary, avatar
    create user object - create entry in db
    remove password and refresh token field from response
    check for user creation
    return res
  */

  // Destructuring user details from the request body
  const { email, password, fullName, userName } = req.body;

  console.log("Email is: " + email);

  // Validation: Checking if any of the required fields is empty
  if (
    [email, password, fullName, userName].some((field) => field?.trim() === "")
  ) {
    throw new ApiErrors(400, "All fields are required");
  }

  // Checking if a user with the same username "or" email already exists
  const existedUser = await User?.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiErrors(409, "User already exists");
  }

  // Getting local paths for avatar and cover image from the request files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImagePath = req.files?.coverImage[0]?.path;

  let coverImagePath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagePath = req.files.coverImage[0].path;
  }

  // Validation: Checking if the avatar is present
  if (!avatarLocalPath) {
    throw new ApiErrors(400, "Avtar is required");
  }

  // Uploading avatar and cover image to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImagePath);

  // Validation: Checking if avatar upload was successful
  if (!avatar) {
    throw new ApiErrors(400, "Avtar is required");
  }

  // Creating a new user in the database
  const user = await User.create({
    userName: userName.toLowerCase(),
    email,
    password,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", // Because coverImage field is not compulsory required
  });

  // Fetching the created user from the database without password and refreshToken fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Checking if user creation was successful
  if (!createdUser) {
    throw new ApiErrors(500, "Something is gonna wrong while registering user");
  }

  // Returning a success response with the created user details
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User Succesfully created"));
});

const genrateAcessAndRefreshToken = async (userId) => {
  try {
    // That give the whole document in a user variable
    const user = await User.findById(userId);

    // get the access token and refresh token
    const acessToken = user.genrateAcessToken();
    const refreshToken = user.genrateRefreshToken();

    // update the refresh token in the document
    user.refreshToken = refreshToken;

    // save method save the user before validating all the fields because we all checked that fields
    user.save({ validBeforeSave: false });

    return { acessToken, refreshToken };
  } catch (error) {
    throw new ApiErrors(
      500,
      "something went wrong while generating refresh and acess token"
    );
  }
};

const login = asynchandler(async (req, res) => {
  /* Login steps:-

  - Get the username and email from the request body
  - find the username or email in the database by find method
  - and check the password
  - if the username and email is not found or anyone incorrect then return error message
  - give refresh token and acees token via cookies
  - or if the username and email founded in the database then navigatte the user
  */

  // Get the username eamil and password
  const { userName, email, password } = req.body;

  // Validate : if the username either email send or not
  if (!(email || userName)) {
    throw new ApiErrors(400, "Enter username or email address");
  }

  // check the userName or email in the database
  // That give the document of the checked userName and email
  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  // Validate : username or email exist or note
  if (!user) {
    throw new ApiErrors(400, "Email or Username not found");
  }

  console.log("User is founded");

  // Check the user password is correct or not with the already declared 'method' in the userScehma
  const isPasswordValid = await user.isPasswordCorrect(password);

  // Validate : Password is correct or not
  if (!isPasswordValid) {
    throw new ApiErrors(400, "Invalid password");
  }

  console.log("Password is correct");

  const { acessToken, refreshToken } = await genrateAcessAndRefreshToken(
    user._id
  );

  // Now give the aceesToken and refreshToken to the user

  const isLoggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Now the cookie have CookieOptions that they will modified only at server
  const options = {
    httpOnly: true,
    secure: true,
  };

  // send the cookie
  return res
    .status(200)
    .cookie("acessToken", acessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: isLoggedUser,
          acessToken,
          refreshToken,
        },
        "User Logged successfully"
      )
    );
});

const logout = asynchandler(async (req, res) => {
  // We already make middleware that pas uerInfo object that give us user document
  await User.findByIdAndUpdate(
    // Get the user document id
    req.userInfo._id,

    {
      $set: {
        refreshToken: undefined,
      },
    },

    // pass the new updated document
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("acessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout successfully"));
});

const acessRefreshToken = asynchandler(async (req, res) => {
  // If user acees token expire then we get the end point to the user so there they refresh his acees token easily
  // so before we give another acess token we verify user refresh token that we already stored in our server session

  // we get user refresh token by cokkkie or body
  const inComingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  // Validate : the refersh token is avvailable or not
  if (!inComingRefreshToken) {
    throw new ApiErrors(401, "Refresh token not found");
  }

  // If refresh token avvailable then we decode that token.
  // we get it decoded token if our incomingRefreshToken is valid
  const decodedToken = jwt.verify(
    inComingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  // we payload only id to genrate refresh token so decoded token stored user id also
  const user = await User.findById(decodedToken?._id);

  // Validation : user is founded or not
  if (!user) {
    throw new ApiErrors(401, "Invalid refresh token");
  }

  // Now check cookie stored refresh token and our server session token is same or not

  // If not then give error message
  if (inComingRefreshToken !== user?.refreshToken) {
    throw new ApiErrors(401, "refresh token is expired or used");
  }

  // Now both cokkie and server acess token are same

  const options = {
    httpOnly: true,
    secure: true,
  };

  // Aganin genrate acees token and refresh token

  const { acessToken, newrefreshToken } = genrateAcessAndRefreshToken(user._id);

  return res
    .status(200)
    .cookie("acessToken", acessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { acessToken: acessToken, refreshToken: newrefreshToken },
        "Acess token updated successfully"
      )
    );

  // If we get a valid refresh token
});

export { register, login, logout, acessRefreshToken };
