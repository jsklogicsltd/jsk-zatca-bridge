# ZATCA Bridge Backend API

FastAPI-based backend for ZATCA E-Invoicing compliance.

## Features

- ✅ **FastAPI** with async/await support
- ✅ **PostgreSQL** with async SQLAlchemy
- ✅ **Alembic** database migrations
- ✅ **Invoice Model** with ZATCA compliance fields
- ✅ **Health Check** endpoint
- ✅ **Pydantic** schemas for validation
- ✅ **Ready for XML processing and ECDSA signing**

## Prerequisites

- Python 3.9+
- PostgreSQL 15+
- Docker & Docker Compose (recommended)

## Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### 2. Start PostgreSQL

**Option A: Using Docker Compose** (Recommended)
```bash
docker compose up -d
```

**Option B: Local PostgreSQL**
```bash
# Create database
createdb zatca_bridge

# Update .env with your connection string
DATABASE_URL=postgresql+asyncpg://your_user:your_password@localhost:5432/zatca_bridge
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 4. Run Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Create invoices table"

# Apply migration
alembic upgrade head
```

### 5. Run the API Server

```bash
# Development with auto-reload
uvicorn app.main:app --reload

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/v1/health

## Project Structure

```
backend/
├── app/
│   ├── api/v1/          # API endpoints
│   │   └── endpoints/   # Health, invoices, etc.
│   ├── core/            # Configuration
│   ├── db/              # Database session & base
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic (XML, Crypto)
│   └── main.py          # FastAPI application
├── alembic/             # Database migrations
├── requirements.txt     # Python dependencies
├── docker-compose.yml   # PostgreSQL container
└── .env                 # Environment variables
```

## Invoice Model

The `Invoice` model includes ZATCA-compliant fields:

- **id**: Primary key
- **uuid**: Unique identifier (UUID4)
- **invoice_number**: Unique invoice number
- **xml_content**: Generated UBL 2.1 XML
- **hash**: SHA256 hash
- **previous_hash**: For blockchain-like chaining
- **status**: DRAFT | SIGNED | REPORTED | CLEARED | REJECTED
- **zatca_response**: JSON field for API responses
- **created_at**, **updated_at**: Timestamps

## Available Endpoints

### Health Check
```
GET /api/v1/health
```

Returns server status and database connectivity.

### Future Endpoints
- `POST /api/v1/invoices` - Create invoice
- `GET /api/v1/invoices/{id}` - Get invoice
- `POST /api/v1/invoices/{id}/sign` - Sign with ECDSA
- `POST /api/v1/invoices/{id}/report` - Report to ZATCA
- `GET /api/v1/invoices/{id}/xml` - Get UBL XML

## Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

## Environment Variables

See `.env.example` for all available configuration options:

- **DATABASE_URL**: PostgreSQL connection string
- **ZATCA_API_URL**: ZATCA API endpoint
- **ZATCA_API_KEY/CSID**: ZATCA credentials
- **SECRET_KEY**: JWT secret key
- **CORS_ORIGINS**: Allowed origins for CORS

## Development

```bash
# Run with auto-reload
uvicorn app.main:app --reload --port 8000

# Run tests (when implemented)
pytest

# Format code
black app/
isort app/

# Type checking
mypy app/
```

## Docker Support

The included `docker-compose.yml` provides PostgreSQL 15:

```bash
# Start PostgreSQL
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Remove data volume
docker compose down -v
```

## Next Steps

1. ✅ Backend foundation complete
2. 🔄 Implement invoice CRUD endpoints
3. 🔄 Add XML generation service (lxml)
4. 🔄 Add ECDSA signing service (cryptography)
5. 🔄 Integrate ZATCA API client
6. 🔄 Add authentication/authorization
7. 🔄 Add unit tests

## Troubleshooting

**Database connection failed**
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database exists

**Alembic migration errors**
- Ensure database is running
- Check that models are imported in `alembic/env.py`
- Try `alembic downgrade -1` then `alembic upgrade head`

**Port already in use**
- Change PORT in `.env`
- Or specify: `uvicorn app.main:app --port 8001`

## License

Proprietary - JSK Logics
