import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import asynchandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asynchandler(async (req, res, next) => {
  try {
    // Because "Authorization" header gives "Bearer <token>",
    // but we need only 'token' so  we can use 'replace' method and chage it to "Bearer " to ""

    const token =
      req.cookies?.acessToken ||
      req.header("Authorization").replace("Bearer ", "");

    // Vaidation : token have or not
    if (!token) {
      throw new ApiErrors(401, "Invalid authorization");
    }

    // thats verify token and return the our genrateAcessToken method payoad
    const decodedTokenInformation = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // And so we get our user document id
    // and we get our user document
    const user = await User.findById(decodedTokenInformation?._id).select(
      "-password -refreshToken"
    );

    // Validation : user is avvailable or not
    if (!user) {
      throw new ApiErrors(401, "Invalid acess token information");
    }

    // So we make Object on our request
    req.userInfo = user;

    // because we use this function as a middleware
    next();
  } catch (error) {
    throw new ApiErrors(401, error?.message || "Invalid acess token ");
  }
});
