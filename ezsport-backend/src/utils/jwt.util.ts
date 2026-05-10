import jwt from "jsonwebtoken";
import { jwtConfig } from "../configs/jwt.config";

export const generateToken = (payload: any) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};