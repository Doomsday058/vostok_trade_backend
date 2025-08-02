// server/lib/mailer.js
// server/lib/mailer.js
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Путь к готовому файлу прайс-листа
const PRICE_LIST_PATH = path.join(__dirname, '..', 'price.xlsx');

// Создаем и тестируем транспорт для отправки писем
let transporter;

const initMailer = async () => {
  console.log('Инициализация почтового сервиса...');
  
  try {
    // Проверка, настроены ли переменные окружения
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ Ошибка: Не настроены параметры SMTP в .env файле');
      console.log('Требуются параметры: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
      return;
    }
    // Используем настройки из .env
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    // Проверяем соединение
    await transporter.verify();
    console.log('✅ Почтовый сервис успешно инициализирован');
    
    // Проверяем наличие файла прайс-листа
    if (fs.existsSync(PRICE_LIST_PATH)) {
      console.log('✅ Файл прайс-листа найден:', PRICE_LIST_PATH);
    } else {
      console.warn('⚠️ Внимание: Файл прайс-листа не найден по пути:', PRICE_LIST_PATH);
      console.log('Пожалуйста, поместите файл price.xlsx в корневую папку сервера.');
    }
  } catch (error) {
    console.error('❌ Ошибка при инициализации почтового сервиса:', error);
    
    // Создаем резервный транспорт с использованием ethereal.email для тестирования
    console.log('🔄 Создание резервного тестового транспорта...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('✅ Резервный почтовый сервис успешно инициализирован');
      console.log(`📧 Email: ${testAccount.user}`);
      console.log(`📧 Password: ${testAccount.pass}`);
      console.log(`📧 Просмотр писем: https://ethereal.email/`);
    } catch (fallbackError) {
      console.error('❌ Не удалось создать даже резервный почтовый сервис:', fallbackError);
    }
  }
};

// Инициализируем почтовый сервис при импорте модуля
initMailer();

/**
 * Отправляет письмо с прайс-листом в виде Excel-файла
 * @param {string} toEmail - Email получателя
 * @param {Array} products - Массив товаров (не используется, т.к. используется готовый файл)
 * @returns {Promise<boolean>} - Успешность отправки
 */
export async function sendPriceByEmail(toEmail, products) {
  try {
    if (!transporter) {
      // Если транспорт еще не инициализирован, пробуем еще раз
      await initMailer();
      if (!transporter) {
        throw new Error('Почтовый сервис не инициализирован');
      }
    }
    
    // Проверяем наличие файла прайс-листа
    if (!fs.existsSync(PRICE_LIST_PATH)) {
      console.error('❌ Ошибка: Файл прайс-листа не найден по пути:', PRICE_LIST_PATH);
      throw new Error('Файл прайс-листа не найден. Пожалуйста, поместите файл price.xlsx в корневую папку сервера.');
    }
    
    // Формируем HTML для письма с корпоративным стилем
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #1f2937;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VOSTOK TRADE COMPANY</h1>
          </div>
          <div class="content">
            <h2>Прайс-лист на продукцию</h2>
            <p>Уважаемый клиент!</p>
            <p>Благодарим вас за интерес к нашей продукции. В прикрепленном файле вы найдете актуальный прайс-лист.</p>
            <p>Если у вас возникнут вопросы, пожалуйста, свяжитесь с нами по контактам, указанным на нашем сайте.</p>
            <p>С уважением,<br>Команда VOSTOK TRADE COMPANY</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VOSTOK TRADE COMPANY. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Настройки письма
    const mailOptions = {
      from: `"VOSTOK TRADE COMPANY" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Прайс-лист VOSTOK TRADE COMPANY',
      html: htmlContent,
      attachments: [
        {
          filename: 'price-list.xlsx',
          path: PRICE_LIST_PATH
        }
      ]
    };
    
    // Отправляем письмо
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Письмо успешно отправлено:', info.messageId);
    
    // Для тестового сервиса ethereal показываем URL для просмотра письма
    if (info.messageId && info.messageUrl) {
      console.log('📧 URL для просмотра письма:', info.messageUrl);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при отправке письма:', error);
    throw error;
  }
}