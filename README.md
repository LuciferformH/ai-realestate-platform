# AI Real Estate Insights Platform

> A modern, AI-powered real estate analytics platform that helps users analyze the housing market, predict property prices, discover investment opportunities, and visualize market trends using interactive dashboards.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-brightgreen)](https://ai-realestate-frontend-neon.vercel.app)
[![CI](https://github.com/LuciferformH/ai-realestate-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/LuciferformH/ai-realestate-platform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Live Demo

**Frontend:** https://ai-realestate-frontend-neon.vercel.app
**Backend API:** https://ai-realestate-backend.onrender.com/api/v1/docs

**Login Credentials:**
- Admin: `admin@realestate.com` / `admin123`
- Test User: `test@realestate.com` / `test123`

## Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (User, Admin, Analyst)
- Login, Signup, Forgot Password flows

### Executive Dashboard
- Total Properties, Average Price, Median Price, Highest/Lowest Price
- Average Price Per Sqft, Number of Cities, Total Listings
- Interactive charts: Line, Bar, Pie, Area, Heatmap, Treemap, Scatter Plot

### Property Management
- Full CRUD operations with image galleries
- Advanced filtering (City, Budget, Bedrooms, Bathrooms, Area, Type)
- Sort by Price, Date, Size
- Property comparison tool

### Advanced Analytics
- Exploratory Data Analysis (EDA)
- Correlation Matrix & Distribution Analysis
- Monthly/Yearly Price Trends
- Growth Rate Analysis
- Investment Score & Rental Yield Calculations

### AI Price Prediction
- Linear Regression, Random Forest, Gradient Boosting, XGBoost models
- Model comparison with MAE, RMSE, R² metrics
- Real-time price prediction from property features
- Feature importance analysis

### Interactive Maps
- Leaflet-based property maps
- Price density heatmaps
- Cluster markers
- Nearby property discovery

### Reports
- PDF property reports
- Excel market analysis
- CSV data export

### Admin Panel
- User management (CRUD, role assignment)
- Property management
- Dataset management (CSV upload, synthetic data generation)
- System analytics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Shadcn/UI |
| Maps | Leaflet, React-Leaflet |
| Charts | Recharts, Chart.js |
| Animations | Framer Motion |
| State | Zustand, React Query |
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| Database | PostgreSQL 15 |
| ML | Scikit-learn, XGBoost, Pandas, NumPy |
| Auth | JWT (python-jose, passlib) |
| Reports | ReportLab, OpenPyXL |
| Deployment | Docker, Docker Compose, GitHub Actions |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│  React + TypeScript + Vite + Tailwind + Recharts   │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP/REST
┌─────────────────┴───────────────────────────────────┐
│                   Backend API                       │
│            FastAPI + SQLAlchemy + Pydantic           │
├─────────────────────────────────────────────────────┤
│              Service Layer                          │
│  PropertyService │ AnalyticsService │ MLService     │
├─────────────────────────────────────────────────────┤
│              Data Layer                             │
│         PostgreSQL │ Joblib Models                  │
└─────────────────────────────────────────────────────┘
```

## Project Structure

```
ai-realestate-platform/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Base UI components (Button, Card, Modal...)
│   │   │   ├── layout/        # Layout components (Sidebar, Header)
│   │   │   ├── charts/        # Chart components (Line, Bar, Pie...)
│   │   │   ├── dashboard/     # Dashboard-specific components
│   │   │   ├── properties/    # Property-related components
│   │   │   ├── map/           # Map components
│   │   │   ├── auth/          # Authentication forms
│   │   │   └── admin/         # Admin panel components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand state stores
│   │   ├── services/          # API service functions
│   │   ├── types/             # TypeScript type definitions
│   │   └── lib/               # Utilities and constants
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── core/              # Config, database, security
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── ml/                # ML model serving
│   │   └── utils/             # Helper functions
│   └── requirements.txt
├── database/                    # Database configuration
│   ├── init.sql               # Schema + seed data
│   ├── seed_data.py           # 100K+ property data generator
│   └── migrations/            # Alembic migrations
├── machine_learning/            # ML training pipeline
│   ├── train.py               # Model training
│   ├── predict.py             # Prediction module
│   ├── evaluate.py            # Model evaluation
│   └── config.py              # ML configuration
├── analytics/                   # Analytics modules
│   ├── eda.py                 # Exploratory Data Analysis
│   ├── trends.py              # Trend analysis
│   ├── investment.py          # Investment scoring
│   └── visualization.py       # Chart generation
├── reports/                     # Report generation
│   ├── pdf_report.py          # PDF reports
│   ├── excel_report.py        # Excel reports
│   └── csv_export.py          # CSV export
├── docker/                      # Docker configuration
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx/nginx.conf
├── docs/                        # Documentation
├── .github/workflows/ci.yml    # CI/CD pipeline
├── .env.example                 # Environment variables
├── .gitignore
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/ai-realestate-platform.git
cd ai-realestate-platform

# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Generate seed data
docker-compose exec backend python -m database.seed_data

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup database
createdb realestate
psql realestate < ../database/init.sql

# Configure environment
cp ../.env.example .env
# Edit .env with your database credentials

# Run backend
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Generate Dataset

```bash
cd database
python seed_data.py
# Generates 100,000+ properties to dataset/properties.csv
```

### Train ML Models

```bash
cd machine_learning
pip install -r requirements.txt
python train.py
# Trains 4 models, compares accuracy, saves to models/
```

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login |
| GET | /api/v1/auth/me | Get current user |
| PUT | /api/v1/auth/me | Update profile |
| POST | /api/v1/auth/refresh | Refresh token |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/properties | List properties (with filters) |
| GET | /api/v1/properties/{id} | Get property details |
| POST | /api/v1/properties | Create property |
| PUT | /api/v1/properties/{id} | Update property |
| DELETE | /api/v1/properties/{id} | Delete property |
| GET | /api/v1/properties/featured | Featured properties |
| GET | /api/v1/properties/stats | Property statistics |
| POST | /api/v1/properties/compare | Compare properties |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/analytics/dashboard | Dashboard stats |
| GET | /api/v1/analytics/charts/line | Line chart data |
| GET | /api/v1/analytics/charts/bar | Bar chart data |
| GET | /api/v1/analytics/charts/pie | Pie chart data |
| GET | /api/v1/analytics/charts/area | Area chart data |
| GET | /api/v1/analytics/charts/scatter | Scatter plot data |
| GET | /api/v1/analytics/correlation | Correlation matrix |
| GET | /api/v1/analytics/monthly-trends | Monthly trends |
| GET | /api/v1/analytics/top-cities | Top cities |

### Machine Learning
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/ml/models | List trained models |
| POST | /api/v1/ml/predict | Predict property price |
| POST | /api/v1/ml/train | Train new model |
| GET | /api/v1/ml/compare | Compare models |
| GET | /api/v1/ml/feature-importance | Feature importance |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/admin/users | List users |
| PUT | /api/v1/admin/users/{id}/role | Update user role |
| POST | /api/v1/admin/upload-csv | Upload CSV data |
| GET | /api/v1/admin/dataset/stats | Dataset statistics |

### Query Parameters (Properties)
- `page` (int): Page number
- `per_page` (int): Items per page (default: 20)
- `city` (string): Filter by city
- `property_type` (string): Filter by type
- `min_price` (float): Minimum price
- `max_price` (float): Maximum price
- `bedrooms` (int): Number of bedrooms
- `bathrooms` (int): Number of bathrooms
- `min_area` (float): Minimum area
- `max_area` (float): Maximum area
- `furnished` (bool): Furnished filter
- `sort_by` (string): Sort field
- `sort_order` (string): asc/desc
- `search` (string): Search in title/address

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@realestate.com | admin123 |
| Test User | test@realestate.com | test123 |

## Deployment

### AWS / GCP / Azure
1. Use Docker images
2. Set environment variables
3. Run with docker-compose
4. Set up PostgreSQL managed service
5. Configure reverse proxy (nginx)

### Vercel (Frontend)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Heroku
```bash
heroku create ai-realestate-api
heroku config:set DATABASE_URL=...
git push heroku main
```

## Environment Variables

See `.env.example` for all required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `CORS_ORIGINS` - Allowed CORS origins
- And more...

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Recharts](https://recharts.org/) - Chart library
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [Scikit-learn](https://scikit-learn.org/) - Machine learning
