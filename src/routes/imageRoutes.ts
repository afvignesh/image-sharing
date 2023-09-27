import express from 'express';
import { addUsersToSharedList, getImage, uploadImage } from '../controllers/imageController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { addUsersToSharedListFromClient, getImageFromClient, uploadImageFromClient } from '../client_controllers/clientOperationsController';

const router = express.Router();

// Endpoint for image upload
router.post('/upload-from-client', authenticateJWT, uploadImageFromClient);
router.post('/upload-image', authenticateJWT, uploadImage);
router.get('/get-from-client/:imageId', authenticateJWT, getImageFromClient);
router.get('/get-image/:imageId', authenticateJWT, getImage);
router.post('/add-shared-users-client', authenticateJWT, addUsersToSharedListFromClient);
router.post('/add-shared-users', authenticateJWT, addUsersToSharedList);




export default router;

