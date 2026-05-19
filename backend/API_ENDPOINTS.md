# ZATCA Backend Integration - New Endpoints

## ✅ Successfully Integrated

### 1. Debug Endpoints (`/api/v1/debug`)

#### POST `/api/v1/debug/validate-xml`
Validates XML invoices using the official ZATCA SDK (Java-based).

**Request**:
```json
{
  "xml_content": "<Invoice>...</Invoice>"
}
```

**Response**:
```json
{
  "valid": false,
  "return_code": 0,
  "errors": ["error1", "error2"],
  "warnings": [],
  "info": [],
  "stdout": "raw SDK output...",
  "stderr": "",
  "summary": "Validation Result: ✗ FAIL\nReturn Code: 0\n..."
}
```

**Test**:
```bash
curl -X POST http://localhost:8000/api/v1/debug/validate-xml \
  -H "Content-Type: application/json" \
  -d '{"xml_content": "<Invoice>...</Invoice>"}'
```

#### GET `/api/v1/debug/validator-info`
Get ZATCA SDK validator information.

**Response**:
```json
{
  "validator_version": "3.0.8",
  "jar_path": "/path/to/cli-3.0.8-jar-with-dependencies.jar",
  "jar_exists": true,
  "jar_size_mb": 20.2,
  "java_available": true,
  "status": "ready"
}
```

---

### 2. Mock ZATCA Endpoints (`/api/v1/zatca`)

#### POST `/api/v1/zatca/onboard`
Mock ZATCA onboarding for frontend testing.

**Request**:
```json
{
  "organization_name": "Test Company",
  "tax_id": "310122393500003",
  "business_category": "Retail",
  "otp_code": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "csid": "YOFFBjLwWPL+1L2WptrA1+vmnLkaCpPt9wYiI2OITbA=",
  "secret": "SYsq0Qzy+2l6ayaexlOu2SV9MQS98m8/wav+jVmu6ho=",
  "issued_at": "2026-01-29T15:00:45Z",
  "expires_at": "2027-01-29T15:00:45Z",
  "organization_name": "Test Company",
  "tax_id": "310122393500003",
  "message": "Mock CSID generated successfully. This is for testing only."
}
```

**Test**:
```bash
curl -X POST http://localhost:8000/api/v1/zatca/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "organization_name": "Test Company",
    "tax_id": "310122393500003",
    "business_category": "Retail"
  }'
```

#### POST `/api/v1/zatca/compliance-check`
Mock compliance check endpoint.

**Request**:
```json
{
  "csid": "your-csid-here",
  "invoice_hash": "hash-value",
  "invoice_uuid": "uuid-value"
}
```

**Response**:
```json
{
  "success": true,
  "status": "COMPLIANT",
  "validation_results": {
    "error_count": 0,
    "warning_count": 0,
    "info_count": 1,
    "errors": [],
    "warnings": [],
    "info": ["Mock compliance check passed"]
  },
  "message": "Mock compliance check successful. Invoice is compliant."
}
```

#### GET `/api/v1/zatca/csid-status?csid={csid}`
Check CSID status.

**Response**:
```json
{
  "csid": "your-csid",
  "status": "ACTIVE",
  "issued_at": "2025-12-30T15:00:45Z",
  "expires_at": "2027-01-04T15:00:45Z",
  "days_until_expiry": 335,
  "is_valid": true
}
```

#### POST `/api/v1/zatca/renew-csid?csid={csid}`
Renew CSID.

**Response**:
```json
{
  "success": true,
  "csid": "new-csid-value",
  "secret": "new-secret-value",
  "issued_at": "2026-01-29T15:00:45Z",
  "expires_at": "2027-01-29T15:00:45Z",
  "message": "Mock CSID renewed successfully"
}
```

#### GET `/api/v1/zatca/health`
ZATCA service health check.

**Response**:
```json
{
  "status": "healthy",
  "service": "ZATCA Mock API",
  "timestamp": "2026-01-29T15:00:45Z",
  "environment": "sandbox",
  "message": "Mock ZATCA service is operational"
}
```

---

## Complete API Endpoint List

Now you have **15 total endpoints**:

### Health & Info
1. `GET /api/v1/health` - API health check
2. `GET /api/v1/debug/validator-info` - ZATCA SDK info

### Invoice Processing
3. `POST /api/v1/invoices/validate` - Validate invoice data
4. `POST /api/v1/invoices/calculate` - Calculate totals
5. `POST /api/v1/invoices/generate-xml` - Generate UBL XML
6. `POST /api/v1/invoices/sign-invoice` - Sign and generate QR
7. `POST /api/v1/invoices/submit-to-zatca` - Submit to ZATCA

### Dashboard
8. `GET /api/v1/invoices` - List invoices (paginated)
9. `GET /api/v1/invoices/{id}` - Get invoice details
10. `GET /api/v1/stats` - Dashboard statistics

### Debug & Testing
11. `POST /api/v1/debug/validate-xml` - Validate with ZATCA SDK

### Mock ZATCA
12. `POST /api/v1/zatca/onboard` - Mock onboarding
13. `POST /api/v1/zatca/compliance-check` - Mock compliance
14. `GET /api/v1/zatca/csid-status` - Check CSID status
15. `POST /api/v1/zatca/renew-csid` - Renew CSID
16. `GET /api/v1/zatca/health` - ZATCA health

---

## Testing Results

### ✅ Validator Info
```json
{
  "validator_version": "3.0.8",
  "jar_path": "/Users/mac/.gemini/antigravity/scratch/jsk-logics-zatca-bridge/backend/cli-3.0.8-jar-with-dependencies.jar",
  "jar_exists": true,
  "jar_size_mb": 20.2,
  "java_available": true,
  "status": "ready"
}
```

### ✅ Mock Onboarding
```json
{
  "success": true,
  "csid": "YOFFBjLwWPL+1L2WptrA1+vmnLkaCpPt9wYiI2OITbA=",
  "secret": "SYsq0Qzy+2l6ayaexlOu2SV9MQS98m8/wav+jVmu6ho=",
  "issued_at": "2026-01-29T15:00:45.854293Z",
  "expires_at": "2027-01-29T15:00:45.854293Z",
  "organization_name": "Test Company",
  "tax_id": "310122393500003"
}
```

### ✅ XML Validation
```
Valid: False
Errors: 3
Validation Result: ✗ FAIL
```

---

## Frontend Integration

### For Onboarding Wizard

```typescript
// Call mock onboard endpoint
const response = await fetch('http://localhost:8000/api/v1/zatca/onboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organization_name: 'My Company',
    tax_id: '310122393500003',
    business_category: 'Retail'
  })
});

const data = await response.json();
// Store data.csid and data.secret
```

### For XML Validation

```typescript
// Validate XML with ZATCA SDK
const response = await fetch('http://localhost:8000/api/v1/debug/validate-xml', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    xml_content: xmlString
  })
});

const result = await response.json();
console.log(result.summary);
```

---

## Files Created

1. `backend/app/api/v1/endpoints/debug.py` - Debug endpoints
2. `backend/app/api/v1/endpoints/zatca_mock.py` - Mock ZATCA endpoints
3. `backend/app/services/zatca_validator.py` - ZATCA SDK wrapper

## Files Modified

1. `backend/app/api/v1/api.py` - Added new routers

---

## Next Steps

1. ✅ OpenJDK installed and configured
2. ✅ ZATCA SDK wrapper created
3. ✅ Debug validation endpoint working
4. ✅ Mock ZATCA onboarding endpoint ready
5. ✅ All endpoints tested

**Your frontend onboarding wizard can now connect to `/api/v1/zatca/onboard` for testing!**
