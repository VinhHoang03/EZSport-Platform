import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../configs/jwt.config";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

interface JwtPayload {
  userId: string;
  role: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token not provided"
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid token format"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        message: "Forbidden"
      });
    }

    next();
  };
};