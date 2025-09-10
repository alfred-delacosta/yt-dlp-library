import argon2 from 'argon2'
import crypto from "node:crypto";
import { generateTokenAndSetCookie } from '../utils/jwt.js';

export const signUp = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new Error("All fields are required.");
    }

    // TODO Get confirm the user from the db exists
    // const userAlreadyExists = await User.findOne({ email });

    // TODO If the user exists then return an error.
    // if (userAlreadyExists) {
    //   return res.status(400).json({ message: "User already exists. " });
    // }

    const hashedPassword = await argon2.hash(password);

    const verificationToken = Math.floor(randomInt(100000, 900000)).toString();

    // TODO Create the new user in the DB and save.
    // const user = new User({
    //   email,
    //   password: hashedPassword,
    //   name,
    //   verificationToken,
    //   verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    // });

    // await user.save();

    // TODO Generate the JWT
    // generateTokenAndSetCookie(res, user._id);

  } catch (error) {
    console.error("Error in signup function: ", error);
    return res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // TODO Get confirm the user from the db exists
    // const user = await User.findOne({ email });

    // TODO If the user does not exists then return an error.
    // if (!user) return res.status(400).json({ message: "Invalid credentials." });

    // TODO Get the password from the user in the db and verify it
    // const isPasswordValid = await argon2.verify(user.password, password);

    // TODO If the passwords do not match, return an error.
    // if (!isPasswordValid)
    //   return res.status(400).json({ message: "Invalid credentials." });

    // TODO Generate the JWT
    // generateTokenAndSetCookie(res, user._id);

    // TODO Return the user and a Logged in successfully message
    // res.status(201).json({
    //   message: "Logged in successfully.",
    //   user: {
    //     ...user._doc,
    //     password: undefined,
    //   },
    // });

    // TODO Set the last login date.
    // user.lastLogin = Date.now();
  } catch (error) {
    console.error("Error in login function: ", error);
    return res.status(400).json({ message: error.message });
  }
};

export const logOut = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully." });
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    // TODO Get the user from the DB and set the verificationToken along with the expiresAt date
    // const user = await User.findOne({
    //   verificationToken: code,
    //   verificationTokenExpiresAt: { $gt: Date.now() }, // $gt is greater than
    // });

    // TODO If the user cannot be found send an error response.
    // if (!user) return res.status(400).json({ message: "Invalid or expired verification code" });

    // TODO Update the user object and save to the DB
    // user.isVerified = true;
    // user.verificationToken = undefined;
    // user.verificationTokenExpiresAt = undefined;
    // await user.save();

    // TODO Send a 200 response along with the user object.
    // res.status(200).json({
    //   message: "Email verified successfully.",
    //   user: {
    //     ...user._doc,
    //     password: undefined,
    //   },
    // });
  } catch (error) {
    console.error("There was an error: ", error);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // TODO Get the user from the DB via email.
    // const user = await User.findOne({ email });
    // TODO If the user cannot be found, return an error response.
    // if (!user) return res.status(400).json({ message: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    // TODO Set the reset tokens on the user and save the user.
    // user.resetPasswordToken = resetToken;
    // user.resetPasswordExpiresAt = resetTokenExpiresAt;
    // await user.save();

    res.status(200).json({ message: "Password reset email sent successfully." });
  } catch (error) {
    console.error("There was an error: ", error);
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    // TODO Find the user from the DB via the resetPasswordToken. If no user is found, return an error response.
    // const user = await User.findOne({ resetPasswordToken: token });
    // if (!user) return res.status(400).json({ message: "Invalid token" });

    // Reset password
    const hashedPassword = await argon2.hash(newPassword);
    // TODO Set the new password on the user object.
    // user.password = hashedPassword;

    // TODO Set the resetToken information on the user to be undefined or empty
    // user.resetPasswordToken = undefined;
    // user.resetPasswordExpiresAt = undefined;

    // TODO Save the user back to the DB.
    // await user.save();

    // TODO Send the 200 response
    // res.status(200).json({
    //   message: "Password reset successful",
    //   user: {
    //     ...user._doc,
    //     password: undefined,
    //   },
    // });
  } catch (error) {
    console.error("There was an error: ", error);
  }
};

// TODO Consider removing this and replacing it with refreshTokens.
export const checkAuth = async (req, res) => {
  try {
    // TODO Find the user from the DB. If no user is found return an error.
    // const user = await User.findById(req.userId);
    // if (!user) return res.status(400).json({ message: "User not found. " });

    // TODO Return a 200 response
    // res.status(200).json({
    //   user: {
    //     ...user._doc,
    //     password: undefined,
    //   },
    // });
  } catch (error) {
    console.log("Error in checkAuth: ", error);
    res.status(400).json({ message: error.message })
  }
};
