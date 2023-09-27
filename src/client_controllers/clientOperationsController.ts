/* ----------------------------------------------------------------
* This file is just for the mock up of frontend.
* This file contains functions like encryption of data and creating symmetric keys
* which ideally should be done on cli
----------------------------------------------------------------*/

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'; // To generate unique filenames
import { pool } from '../db';
import axios from 'axios';
import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const storageApiUrl = 'http://localhost:3000/img/upload-image';

export const uploadImageFromClient = async (req: Request, res: Response) => {
    const { sharedWithUsernames, imagePath } = req.body; // Expect an array of usernames
    const username = req.user.username; // Assuming you have user authentication in place
    const auth = req.headers['authorization']; 
  
    try {
      // Generate a random symmetric encryption key for the image
      const symmetricKey = crypto.randomBytes(32); // 256 bits key
  
      // Encrypt the image with the symmetric key
      const imageBuffer = fs.readFileSync(imagePath);

      const hash = crypto.createHash('sha256');
      hash.update(imageBuffer);
      const hashValue = hash.digest('hex');
      
      const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, Buffer.alloc(16, 0));
      const encryptedImage = Buffer.concat([cipher.update(imageBuffer), cipher.final()]);
  
      // Insert the encrypted image and shared users into the database
      const sharedUsers = [];
      sharedWithUsernames.push(username); //since the main user should also be able to view the image
  
      for (const sharedWithUsername of sharedWithUsernames) {
        // Check if the sharedWithUsername exists in the users table
        const userQuery = 'SELECT username, public_key FROM users WHERE username = $1';
        const userResult = await pool.query(userQuery, [sharedWithUsername]);
  
        if (userResult.rows.length === 1) {
          const sharedWithUserId = userResult.rows[0].username;
          const publicKey = Buffer.from(userResult.rows[0].public_key, 'utf-8'); 
  
          // Encrypt the symmetric key with the user's public key
          const encryptedSymmetricKey = crypto.publicEncrypt(publicKey, symmetricKey);
  
          sharedUsers.push({
            username: sharedWithUserId,
            encrypted_symmetric_key: encryptedSymmetricKey.toString('base64'),
          });
  
        }
      }

      const currentTimestamp = new Date().getTime();
      const storageApiData = {
        imageId: username + currentTimestamp,
        encryptedImage: encryptedImage.toString('base64'),
        sharedUsers: sharedUsers,
        hash_value: hashValue
      };

      // Actual call to our backend
      // Creating the mokup scenario on how the 
      // client can call our backend to save the image and also the related metadata.
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, application/xml",
        "Authorization": auth
      };
      const uploadResp = await axios.post(storageApiUrl, storageApiData, {headers});
      res.status(201).send({msg: 'Image uploaded and shared successfully', data: JSON.stringify(uploadResp.data)});
    } catch (error) {
      console.error(error);
      res.status(500).send('Error uploading image');
    }
  };

export const getImageFromClient = async (req: Request, res: Response) => {
  const { imageId } = req.params; // Assuming you pass the image ID in the URL
  const auth = req.headers['authorization']; 
  const username = req.user.username;
  const viewImageUrl = `http://localhost:3000/img/get-image/${imageId}`;
  try {
    // Call the validation and retrieval API to get the encrypted image
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json, application/xml",
      "Authorization": auth
    };

    // Actual call to our backend
    // Creating the mokup scenario on how the 
    // client can call our backend to get the image.
    const response = await axios.get(viewImageUrl, {headers});

    if (response.status !== 200) {
      res.status(response.status).send(response.data);
      return;
    }
    const rootPath = path.join(__dirname, '../../'); // Move up two directories to reach the root directory
    const folderPath = path.join(rootPath, 'test_users');
    const keyPairsJSON = fs.readFileSync(path.join(folderPath, 'userKeyPairs.json'), 'utf-8');
    const parsedKeyPairs: any = JSON.parse(keyPairsJSON);
    let private_key = Buffer.from(parsedKeyPairs[username].privateKey, 'utf-8'); 
    const {encryptedImage, encrypted_key, hash_value} = response.data;

    const decryptedSymmetricKey = crypto.privateDecrypt(private_key, Buffer.from(encrypted_key, 'base64'));
    const decipher = crypto.createDecipheriv('aes-256-cbc', decryptedSymmetricKey, Buffer.alloc(16, 0));
    const decryptedImage = Buffer.concat([decipher.update(encryptedImage, 'base64'), decipher.final()]);
  
    const hash = crypto.createHash('sha256');
    hash.update(decryptedImage);
    const hashValue = hash.digest('hex');

    if (hashValue != hash_value) {
      console.error('ERROR: Image integrity check failed. Image may be tampered with.');
      res.status(500).send('Image integrity check failed. Image may be tampered with');
    }

    // Send the decrypted image as the response
    res.setHeader('Content-Type', 'image/jpeg');
    res.status(200).send(decryptedImage);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error viewing and decrypting image');
  }
}
