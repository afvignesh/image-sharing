import { Request, Response } from 'express';
import { pool } from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto  from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config();

function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Adjust the key length as needed
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return { publicKey, privateKey };
}

export const registerUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Generate a salt
    const saltRounds = 10; // Number of salt rounds
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash the user's password with the salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // We do this for now
    // But in ideal case the client should provide us with 
    // public key and keep the private key to themselves.
    const { publicKey, privateKey } = generateKeyPair();

    // Insert the user into the database with the hashed password and salt
    const query = 'INSERT INTO users (username, password, salt, public_key) VALUES ($1, $2, $3, $4)';
    await pool.query(query, [username, hashedPassword, salt, publicKey]);

    const rootPath = path.join(__dirname, '../../'); // Move up two directories to reach the root directory
    const folderPath = path.join(rootPath, 'test_users');
    const keyPairsJSON = fs.readFileSync(path.join(folderPath, 'userKeyPairs.json'), 'utf-8');
    const parsedKeyPairs: any = JSON.parse(keyPairsJSON);

    // We expect this to be stored in client device
    // But for illustration purposes we save it to the file system
    parsedKeyPairs[username] = {
      publicKey: publicKey,
      privateKey: privateKey
    }
    
    fs.writeFileSync(path.join(folderPath, 'userKeyPairs.json'), JSON.stringify(parsedKeyPairs));

    res.status(201).send({msg: 'User registered successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = $1';

  try {
    const result = await pool.query(query, [username]);

    if (result.rows.length === 1) {
      const user = result.rows[0];
      const storedPassword = user.password; // Get the hashed password from the database

      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, storedPassword);

      if (isPasswordValid) {
        const expiresIn = '1h'
        const jwtSecret = process.env.JWT_SECRET || 'default-secret'; 

        const token = jwt.sign({ username: user.username }, jwtSecret, {expiresIn});
        res.status(200).json({ token });
      } else {
        res.status(401).send('Invalid credentials');
      }
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
};



