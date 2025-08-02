// lib/generatePDF.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Генерирует PDF файл с данными о товарах.
 * @param {Array} products – Массив товаров
 * @returns {Promise<string>} – Путь к сгенерированному PDF файлу
 */
export function generatePricePDF(products) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const fileName = `price-${Date.now()}.pdf`;
    // Предположим, что PDF сохраняется в папке public для прямого доступа
    const filePath = path.join(process.cwd(), 'public', fileName);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Заголовок
    doc.fontSize(24).text('Прайс-лист', { align: 'center' });
    doc.moveDown();

    // Перебор товаров
    products.forEach(product => {
      doc.fontSize(16).text(`Название: ${product.name}`);
      doc.fontSize(14).text(`Цена: ${product.price} руб.`);
      if (product.description) {
        doc.fontSize(12).text(`Описание: ${product.description}`);
      }
      doc.moveDown();
    });

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}
