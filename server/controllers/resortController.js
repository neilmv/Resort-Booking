const db = require('../config/database');

const getAllResorts = async (req, res) => {
  try {
    const query = `
      SELECT *, 
             (SELECT COUNT(*) FROM bookings WHERE resort_id = resorts.id AND status = 'confirmed') as bookings_count
      FROM resorts 
      ORDER BY rating DESC
    `;
    
    const [results] = await db.execute(query);
    
    const resorts = results.map(resort => ({
      ...resort,
      amenities: JSON.parse(resort.amenities)
    }));
    
    res.json(resorts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getResortById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM resorts WHERE id = ?';
    const [results] = await db.execute(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Resort not found' });
    }
    
    const resort = {
      ...results[0],
      amenities: JSON.parse(results[0].amenities)
    };
    
    res.json(resort);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const createBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out, guests } = req.body;
    const user_id = req.user.id;

    console.log('Booking request:', { resort_id: id, user_id, check_in, check_out, guests });

    if (!check_in || !check_out || !guests) {
      return res.status(400).json({ message: 'Missing required fields: check_in, check_out, guests' });
    }

    const getPriceQuery = 'SELECT price_per_night FROM resorts WHERE id = ?';
    const [priceResults] = await db.execute(getPriceQuery, [id]);

    if (priceResults.length === 0) {
      return res.status(404).json({ message: 'Resort not found' });
    }

    const pricePerNight = priceResults[0].price_per_night;
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const totalPrice = pricePerNight * nights;

    const bookingQuery = `
      INSERT INTO bookings (user_id, resort_id, check_in, check_out, guests, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
    `;

    const [result] = await db.execute(bookingQuery, [user_id, id, check_in, check_out, guests, totalPrice]);

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.insertId,
      totalPrice,
      nights
    });
  } catch (err) {
    console.error('Booking error:', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.id;

    const query = `
      SELECT 
        b.id as booking_id,
        b.check_in,
        b.check_out,
        b.guests,
        b.total_price,
        b.status,
        b.created_at as booking_date,
        r.id as resort_id,
        r.name as resort_name,
        r.location,
        r.image_url,
        r.rating
      FROM bookings b
      JOIN resorts r ON b.resort_id = r.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `;

    const [results] = await db.execute(query, [user_id]);
    
    res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllResorts, getResortById, createBooking, getUserBookings };