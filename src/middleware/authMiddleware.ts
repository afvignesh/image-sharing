import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

require('dotenv').config();

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).send('Unauthorized');
  }
  
  const jwtSecret = process.env.JWT_SECRET || 'default-secret';
  jwt.verify(token.split(" ")[1], jwtSecret, (err, decoded) => {
    if (err) {
      console.error(err);
      return res.status(401).send('Unauthorized');
    }
    req.user = decoded
    next();
  });
};