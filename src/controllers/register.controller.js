import asynchandler from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export default register;
