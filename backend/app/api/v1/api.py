from fastapi import APIRouter
from app.api.v1.endpoints import health_router
from app.api.v1.endpoints.invoices import router as invoices_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.debug import router as debug_router
from app.api.v1.endpoints.zatca_mock import router as zatca_mock_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.upload import router as upload_router

router = APIRouter()

# Include health check
router.include_router(health_router, tags=["health"])

# Include authentication
router.include_router(auth_router, prefix="/auth", tags=["authentication"])

# Include invoice validation
router.include_router(invoices_router, prefix="/invoices", tags=["invoices"])

# Include dashboard
router.include_router(dashboard_router, tags=["dashboard"])

# Include debug endpoints
router.include_router(debug_router, prefix="/debug", tags=["debug"])

# Include mock ZATCA endpoints
router.include_router(zatca_mock_router, prefix="/zatca", tags=["zatca-mock"])

# Include file upload endpoints
router.include_router(upload_router, prefix="/upload", tags=["file-upload"])

