// Server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import dbConnect from './lib/db.js';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from './lib/models/User.js';
import Product from './lib/models/Product.js';   
import PriceRequest from './lib/models/PriceRequest.js'; 
import xlsx from 'xlsx'
import path from 'path'
import { fileURLToPath } from 'url'
import { sendPriceByEmail } from './lib/mailer.js';
dotenv.config() 
await dbConnect();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    const allowedOrigins = [
      'http://localhost:3000',
      'https://vostok-trade-frontend.vercel.app',
      'https://vostok-trade-frontend-git-main-doomsdays-projects-4e777191.vercel.app',
      'https://vostok-trade-frontend-6370dzto2-doomsdays-projects-4e777191.vercel.app'
    ];
    // Паттерн для превью-ссылок Vercel тоже выглядит корректно
    const vercelPreviewPattern = /^https:\/\/vostok-trade-frontend-.*\.vercel\.app$/;
    if (allowedOrigins.indexOf(origin) !== -1 || vercelPreviewPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Рекомендуется добавить для поддержки передачи cookie и заголовков авторизации
};

app.use(cors(corsOptions));       // Разрешаем CORS

// Маршрут для получения данных текущего пользователя
app.get('/api/auth/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Not authorized' })
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ user })
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
})


// Маршрут для получения списка товаров
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({})
    res.status(200).json(products)
  } catch (error) {
    console.error('Ошибка при получении товаров:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Маршрут для создания нового товара
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body)
    res.status(201).json(newProduct)
  } catch (error) {
    console.error('Ошибка при создании товара:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Middleware авторизации
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Not authorized' })
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// Регистрация (обновлено для поддержки userType вместо inn)
app.post('/api/register', async (req, res) => {
  const { companyName, email, password, userType } = req.body
  
  try {
    // Проверка, не существует ли уже такого email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({
      companyName: companyName || '',
      email,
      password: hashedPassword,
      userType: userType || 'personal'
    })
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
    res.status(201).json({ user: { ...user._doc, password: null }, token })
  } catch (error) {
    console.error('Ошибка при регистрации:', error)
    res.status(500).json({ message: error.message })
  }
})

// Логин
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  
  try {
    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Неверные учетные данные' })
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { ...user._doc, password: null } })
  } catch (error) {
    console.error('Ошибка при входе:', error)
    res.status(500).json({ message: error.message })
  }
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Загрузка прайса из Excel
app.post('/api/upload-price', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
  
  try {
    const workbook = xlsx.readFile(path.join(__dirname, 'price.xlsx'))
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = xlsx.utils.sheet_to_json(sheet)
    
    await Product.deleteMany({})
    await Product.insertMany(data)
    
    res.json({ message: 'Price list updated', count: data.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Запрос прайса
app.post('/api/request-price', authMiddleware, async (req, res) => {
  try {
    // Проверяем, существует ли пользователь и его email
    if (!req.user || !req.user.email) {
      return res.status(400).json({ 
        message: 'Некорректные данные пользователя'
      });
    }
    
    // Получаем товары из базы данных для включения в прайс-лист
    const products = await Product.find({});
    
    // Создаем запись о запросе прайс-листа
    const priceRequest = await PriceRequest.create({
      user: req.user._id,
      email: req.user.email,
      requestDate: new Date(),
      status: 'sent',
      expiresAt: new Date(Date.now() + 3*24*60*60*1000) // Срок действия 3 дня
    });
    
    // Отправляем прайс-лист по электронной почте
    await sendPriceByEmail(req.user.email, products);
    
    res.status(200).json({ 
      success: true, 
      message: 'Прайс-лист успешно отправлен на вашу почту',
      requestId: priceRequest._id
    });
    
  } catch (error) {
    console.error('Ошибка при запросе прайс-листа:', error);
    res.status(500).json({ 
      success: false,
      message: 'Произошла ошибка при отправке прайс-листа'
    });
  }
});

// Получение истории запросов прайс-листов
app.get('/api/price-requests', authMiddleware, async (req, res) => {
  try {
    // Проверяем, существует ли пользователь
    if (!req.user || !req.user._id) {
      return res.status(400).json({ 
        message: 'Некорректные данные пользователя'
      });
    }
    
    // Получаем запросы для текущего пользователя
    const priceRequests = await PriceRequest.find({ user: req.user._id })
      .sort({ requestDate: -1 })  // Сортировка от новых к старым
      .limit(10);  // Ограничиваем 10 последними запросами
    
    res.status(200).json(priceRequests);
    
  } catch (error) {
    console.error('Ошибка при получении истории запросов:', error);
    res.status(500).json({ 
      success: false,
      message: 'Произошла ошибка при получении истории запросов'
    });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
})