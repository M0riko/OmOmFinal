const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const TrainerBooking = require('../models/TrainerBooking');
const TrainerChat = require('../models/TrainerChat');

const JWT_SECRET = process.env.JWT_SECRET || 'omom-super-secret-key';

const TRAINERS_PROFILES = {
  alex: { name: "Олександр Коваленко", specialty: "Набір маси та сила", style: "мотивуючий, вимогливий, використовує сленг бодібілдерів" },
  elena: { name: "Олена Ростова", specialty: "Йога, стретчинг та кор", style: "спокійна, духовна, фокусується на диханні та гармонії" },
  dmitry: { name: "Дмитро Кравченко", specialty: "Схуднення та кардіо HIIT", style: "дуже енергійний, швидкий, змушує виходити із зони комфорту" },
  nikita: { name: "Нікіта Глухих", specialty: "Функціональний тренінг та реабілітація", style: "науковий, уважний до техніки та здоров'я суглобів" }
};

async function generateTrainerReply(trainerId, userMessage) {
  try {
    const trainer = TRAINERS_PROFILES[trainerId] || { name: "Тренер", specialty: "Загальний фітнес", style: "допомагає та підтримує" };
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: `Ти фітнес-тренер на ім'я ${trainer.name}. Твоя спеціалізація: ${trainer.specialty}. Твій стиль спілкування: ${trainer.style}. Ти спілкуєшся з клієнтом у месенджері. Відповідай дуже коротко (1-3 речення), як у чаті. Якщо користувач задає питання, дай конкретну пораду. Якщо вітається - привітайся. Завжди відповідай українською мовою.` },
          { role: "user", content: userMessage }
        ]
      })
    });
    
    if (!response.ok) return "Вибачте, зараз я на персональному тренуванні. Відповім трохи згодом!";
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error("Groq error:", err);
    return "Вибачте, маю проблеми зі зв'язком. Напишіть трохи пізніше!";
  }
}

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (ex) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.use(authMiddleware);

// GET /api/trainers/bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await TrainerBooking.find({ userId: req.user.id }).sort({ date: 1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trainers/bookings
router.post('/bookings', async (req, res) => {
  try {
    const { trainerId, trainerName, trainerSpecialty, trainerImage, date, timeSlot } = req.body;
    
    // Check for duplicate booking at the same time
    const existing = await TrainerBooking.findOne({
      trainerId,
      date,
      timeSlot,
      status: { $ne: 'cancelled' }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'This time slot is already booked.' });
    }

    const booking = new TrainerBooking({
      userId: req.user.id,
      trainerId,
      trainerName,
      trainerSpecialty,
      trainerImage,
      date,
      timeSlot,
      status: 'scheduled'
    });
    await booking.save();
    
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/trainers/bookings/:id
router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await TrainerBooking.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/trainers/chats
router.get('/chats', async (req, res) => {
  try {
    const { trainerId } = req.query;
    if (!trainerId) return res.status(400).json({ error: 'trainerId is required' });

    const chats = await TrainerChat.find({ userId: req.user.id, trainerId }).sort({ timestamp: 1 });
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trainers/chats
router.post('/chats', async (req, res) => {
  try {
    const { trainerId, message, sender } = req.body;
    
    const chat = new TrainerChat({
      userId: req.user.id,
      trainerId,
      message,
      sender: sender || 'user'
    });
    
    await chat.save();
    res.json({ chat });

    // Generate trainer reply asynchronously
    if (!sender || sender === 'user') {
      generateTrainerReply(trainerId, message).then(async (reply) => {
         const trainerChat = new TrainerChat({
           userId: req.user.id,
           trainerId,
           message: reply,
           sender: 'trainer'
         });
         await trainerChat.save();
      }).catch(console.error);
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
