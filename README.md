# SmartRecruiter

A platform to assess technical skills of software development interviewees, automating in-person technical interviews.

## Overview
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Flask + PostgreSQL
- **Testing**: Jest (Client), pytest (Server)
- **CI/CD**: GitHub Actions

## Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- PostgreSQL

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/awuorochelle75/SmartRecruiter.git
cd SmartRecruiter
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```
- Access at `http://localhost:5173`

### 3. Server Setup
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```
- Access API at `http://localhost:5000`

### 4. Run Tests
- Client: `cd client && npm test`
- Server: `cd server && pytest`

### 5. CI/CD
- Push to `main` to trigger GitHub Actions.

## Contributing
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/xyz`).
3. Commit changes (`git commit -m "description"`).
4. Push and submit a PR.

## License
MIT