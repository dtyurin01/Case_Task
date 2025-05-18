# Weather Dashboard and Subscription Service ☀️

A simple web application that provides current weather information for any city and allows users to subscribe for daily weather updates via email.

## Features

- **Fetch current weather** using the WeatherAPI ([https://www.weatherapi.com](https://www.weatherapi.com)).
- **Subscribe** to daily weather reports for a chosen city.
- **Confirmation emails** and **daily updates** sent via SendGrid.
- **Unsubscribe** functionality to stop further emails.
- Clean, responsive UI built with React and Vite.

## Tech Stack

- **Backend**:
  - Node.js & Express
  - Prisma ORM with PostgreSQL
  - WeatherAPI for fetching weather data
  - SendGrid for sending transactional emails
- **Frontend**:
  - React
  - Vite

## Deployment

The application is deployed and can be tested at:

> [https://case-task-frontend.onrender.com/](https://case-task-frontend.onrender.com/)


### Prerequisites

- Node.js 
- PostgreSQL database (connection URL)
- SendGrid account and API key
- WeatherAPI key

### Environment Variables

Create a `.env` file in both the `backend/` and `frontend/` directories with the following keys.

**Backend `**

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname>?schema=public
PORT=4000
APP_URL=https://case-task.onrender.com
WEATHER_API_KEY=<your_weatherapi_key>
SENDGRID_API_KEY=<your_sendgrid_api_key>
SENDGRID_FROM=<verified_sender_email>
FRONTEND_URL=https://case-task-frontend.onrender.com
```

**Frontend `**

```env
VITE_API_URL=https://case-task.onrender.com
```

### Running Locally

1. **Clone the repo**
   ```bash
   git clone https://github.com/dtyurin01/Case_Task.git
   cd Case_Task
   ```

2. **Backend**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init    # apply migrations locally
   npm run dev
   ```

3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open your browser:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:4000/api/weather?city=London`

## Usage

- Enter a city name and click **Get Weather** to view current conditions.
- Enter your email, select frequency (e.g., hourly, daily) and click **Enter email** to subscribe.
- Confirm your subscription via the email sent by SendGrid.
- You will receive daily weather updates at your chosen frequency.
- To unsubscribe, click the **Unsubscribe** button or use the link in your email.

## Limitations

- Does **not** fetch weather for Ukrainian city names written in Ukrainian. Instead of `Mykolaiv`, only **`Nikolaev`** is supported.


