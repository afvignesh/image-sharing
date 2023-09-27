import express from 'express';
import { getImage, uploadImage } from '../controllers/imageController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { getImageFromClient, uploadImageFromClient } from '../client_controllers/clientOperationsController';

const router = express.Router();

// Endpoint for image upload
router.post('/upload-from-client', authenticateJWT, uploadImageFromClient);
router.post('/upload-image', authenticateJWT, uploadImage);
router.get('/get-from-client/:imageId', authenticateJWT, getImageFromClient);
router.get('/get-image/:imageId', authenticateJWT, getImage);


export default router;

