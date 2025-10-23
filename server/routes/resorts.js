const express = require('express');
const { getAllResorts, getResortById, createBooking, getUserBookings } = require('../controllers/resortController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllResorts);
router.get('/:id', getResortById);
router.post('/:id/book', authMiddleware, createBooking);
router.get('/user/bookings', authMiddleware, getUserBookings); 
module.exports = router;