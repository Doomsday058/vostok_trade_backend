// server/lib/db.js
import mongoose from 'mongoose';

const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  // Добавляем проверку наличия строки подключения
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI не найден в переменных окружения");
    throw new Error("MONGODB_URI не найден в переменных окружения");
  }
  
  try {
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 20000, // Увеличиваем таймаут до 15 секунд
    });
    
    console.log("Connected to MongoDB:", 
        process.env.MONGODB_URI.includes('@') 
        ? process.env.MONGODB_URI.split('@')[1] 
        : process.env.MONGODB_URI
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export default dbConnect;