# Identity Reconciliation API

Bitespeed backend task implementation in TypeScript

## Overview

This API identifies and reconciles customer identities based on email addresses and phone numbers. When customers provide contact information, the system automatically links related contacts and maintains a primary/secondary contact relationship.

## Features

- **Identity Reconciliation**: Links contacts based on shared email or phone number
- **Primary/Secondary Relationships**: Maintains contact hierarchy
- **TypeScript**: Full type safety
- **MySQL Database**: Reliable data persistence
- **Input Validation**: Email and phone number format validation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up MySQL database:
```bash
mysql -u root -p < schema.sql
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Build and run:
```bash
npm run build
npm start
```

## API Endpoints

### POST /identify

Identifies and reconciles customer identity.

**Request:**
```json
{
  "email": "customer@example.com",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["customer@example.com"],
    "phoneNumbers": ["+1234567890"],
    "secondaryContactIds": [2, 3]
  }
}
```

### GET /health

Health check endpoint.

## Development

- `npm run dev`: Start development server
- `npm run build`: Build TypeScript
- `npm start`: Start production server
