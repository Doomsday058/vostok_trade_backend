<div align="center">

# B2B API-сервер "VOSTOK TRADE COMPANY" (Node.js)

_Бэкенд-сервис на Node.js/Express для управления пользователями, каталогом товаров, запросами прайс-листов и отправкой email._

</div>

<p align="center">
    <img src="https://img.shields.io/badge/status-live-success?style=for-the-badge" alt="Статус">
    <img src="https://img.shields.io/github/last-commit/Doomsday058/vostok_trade_backend?style=for-the-badge" alt="Последний коммит">
    <img src="https://img.shields.io/badge/node.js-v18+-green?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
</p>

---

### 🔗 **https://zass.ro/other-pages/centre-service.html(https://vostok-trade-api.onrender.com)**

---

### 🏛️ Архитектура проекта

Этот сервис является бэкендом для B2B-платформы и предоставляет API для клиентской части.

| Сервис | Описание | Репозиторий |
| :--- | :--- | :--- |
| 🎨 **Frontend (Next.js)** | Пользовательский интерфейс, развернутый на Vercel. | **[Перейти](https://github.com/Doomsday058/vostok_trade_frontend)** |
| ⚙️ **Backend (Node.js)** | Основной API для всей бизнес-логики. | _(текущий)_ |

---

### 🚀 Основные возможности

| Функция | Описание |
| :--- | :--- |
| **🔐 Аутентификация** | Регистрация и логин для юридических/физических лиц с использованием JWT. |
| **📦 Управление товарами** | CRUD-операции для каталога продукции в базе данных MongoDB. |
| **📧 Отправка прайс-листов** | Автоматическая отправка актуального прайс-листа на email пользователя по запросу. |
| **👤 Личный кабинет** | Предоставление данных для личного кабинета, включая историю запросов. |

---

### 🛠️ Технологический стек

<p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose" />
    <img src="https://img.shields.io/badge/JSON_Web_Tokens-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
    <img src="https://img.shields.io/badge/Nodemailer-2A7D2E?style=for-the-badge" alt="Nodemailer" />
</p>

---

<details>
<summary>▶️ 📦  <strong>Инструкции по установке и запуску</strong></summary>

<br>

1.  **Клонируйте репозиторий:**
    ```bash
    git clone [https://github.com/Doomsday058/vostok_trade_backend.git](https://github.com/Doomsday058/vostok_trade_backend.git)
    cd vostok-trade-backend
    ```

2.  **Установите зависимости:**
    ```bash
    npm install
    ```

3.  **Создайте файл `.env`** в корне проекта и добавьте переменные:
    ```
    # Строка подключения к базе данных MongoDB Atlas
    MONGODB_URI="mongodb+srv://..."

    # Секретный ключ для подписи JWT-токенов
    JWT_SECRET="..."
    
    # Данные для почтового сервера (SMTP)
    SMTP_HOST="..."
    SMTP_PORT="..."
    SMTP_USER="..."
    SMTP_PASS="..."

    # Порт для локального запуска
    PORT="8000"
    ```

4.  **Запустите сервер:**
    ```bash
    node server/server.js
    ```

</details>
