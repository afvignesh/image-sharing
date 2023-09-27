import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'; // To generate unique filenames
import { pool } from '../db';

export const uploadImage = async (req: Request, res: Response) => {
    const { encryptedImage, sharedUsers, hash_value } = req.body; // Assuming you send these details from your upload API
    const username = req.user.username

    try {
      let imageId = uuidv4().toString();
      // Insert the encrypted image and shared users into the database
      const imageQuery = 'INSERT INTO images (image_id, encrypted_image, hash_value, owner_id) VALUES ($1, $2, $3, $4)';
      await pool.query(imageQuery, [imageId, encryptedImage, hash_value, username]);
  
      // Insert the shared users into a shared_users table
      for (const sharedUser of sharedUsers) {
        const { username, encrypted_symmetric_key } = sharedUser;
        const sharedUsersQuery = 'INSERT INTO shared_users (image_id, user_id, encrypted_symmetric_key) VALUES ($1, $2, $3)';
        await pool.query(sharedUsersQuery, [imageId, username, encrypted_symmetric_key]);
      }
  
      res.status(201).send({msg: 'Image and shared users data stored successfully', imageId: imageId});
    } catch (error) {
      console.error(error);
      res.status(500).send('Error storing data');
    }
};

export const addUsersToSharedList = async(req: Request, res: Response) => {
  const username = req.user.username
  const { image_id, shared_users } = req.body;
  try{
    const imageQuery = 'SELECT owner_id FROM images WHERE image_id = $1';
    const imageResult = await pool.query(imageQuery, [image_id]);

    if (imageResult.rows.length == 0 || imageResult.rows[0].owner_id != username) {
      res.status(401).send('User is not the owner of this image');
      return
    }

    for (const sharedUser of shared_users) {
      const { username, encrypted_symmetric_key } = sharedUser;
      const sharedUsersQuery = 'INSERT INTO shared_users (image_id, user_id, encrypted_symmetric_key) VALUES ($1, $2, $3)';
      await pool.query(sharedUsersQuery, [image_id, username, encrypted_symmetric_key]);
    }

    res.status(201).send({msg: 'Image and shared users data stored successfully', imageId: image_id});
  } catch (error) {
    console.error(error);
    console.log(error)
    res.status(500).send('Error Adding Users to Shared List 1');
  }
}


export const getImage = async (req: Request, res: Response) => {
    const { imageId } = req.params; 
    const username = req.user.username;
  
    try {
      // Check if the image is shared with the user
      const shareQuery = 'SELECT id, encrypted_symmetric_key FROM shared_users WHERE image_id = $1 AND user_id = $2';
      const shareResult = await pool.query(shareQuery, [imageId, username]);
      
  
      if (shareResult.rows.length === 0) {
        res.status(403).send('Image is not shared with the user');
        return;
      }
      const encrypted_symmetric_key = shareResult.rows[0].encrypted_symmetric_key
      // Fetch the encrypted image from the database
      const imageQuery = 'SELECT encrypted_image, hash_value FROM images WHERE image_id = $1';
      const imageResult = await pool.query(imageQuery, [imageId]);
      if (imageResult.rows.length === 0) {
        res.status(404).send('Image not found');
        return;
      }
      // Send the encrypted image as the response
      const encryptedImage = imageResult.rows[0].encrypted_image;
      const hashValue = imageResult.rows[0].hash_value;
      res.status(200).send({encryptedImage: encryptedImage, encrypted_key: encrypted_symmetric_key, hash_value: hashValue});
    } catch (error) {
      console.error(error);
      res.status(500).send('Error validating and retrieving image');
    }
  };
  

