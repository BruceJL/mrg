# Trophy Record Sheet PDF Generation — Design

**Date:** 2026-03-10
**Branch:** feat/trophy-forms

## Problem

When a competition winner receives their trophy, they must hand-fill a Trophy Record Sheet before taking it home. This is currently a blank paper form. The system already has most of the required data (name, school, robot, phone, email) but it isn't used, creating extra manual work and potential for errors.

## Goal

Auto-generate a pre-filled Trophy Record Sheet PDF for each winner and include it in the same certificate print batch. Winners only need to hand-fill: received-by signature, trophy location, and t-shirt size.

## Data Flow

No frontend changes. The existing "Download Certificates" button triggers `POST /api/flask/generate-event-certificates` with `place1/place2/place3` robot IDs and `competition` ID.

Updated backend flow:
1. Generate winner certificates (existing — 3 ODTs)
2. Generate trophy record sheets (new — 3 ODTs)
3. Convert all 6 ODTs to PDFs via LibreOffice (existing pipeline)
4. Merge all 6 PDFs into one using `pypdf`
5. Return merged PDF to browser

**Batch order:**
1. 1st place certificate
2. 1st place trophy sheet
3. 2nd place certificate
4. 2nd place trophy sheet
5. 3rd place certificate
6. 3rd place trophy sheet

## Trophy Record Sheet Fields

| Field | Value |
|---|---|
| Year | Current year (CST) |
| Trophy/Competition | `event.long_name` |
| Place | "1st Place" / "2nd Place" / "3rd Place" |
| Date | Current date in CST (e.g., March 10, 2026) |
| Driver's Name(s) | All non-empty drivers: `driver1`, `driver2`, `driver3` |
| School/Team | `robot.school` |
| Phone | `robot.ph` |
| Email | `robot.email` |
| Robot Name | `robot.name` |
| Received by (print) | blank |
| Signature | blank line |
| Trophy Location | blank |
| T-Shirt Size | blank |

No fax field. Portrait orientation (8.5" x 11").

## Implementation Components

### New file: `pod/flask/python/TrophyRecordSheet.py`
- `make_trophy_record_sheet(winners, event)` — entry point, mirrors `EventCertificate.py` structure
- `make_trophy_record_sheet_odoc(winner, event, place, date_cst)` — builds a single ODT for one winner using `odfpy`
- Uses `pytz` or `datetime` with UTC offset for CST date (-6h standard, -5h daylight)

### Modified: `pod/flask/python/api.py`
- Import `TrophyRecordSheet` and `pypdf`
- In `EventCertificate` POST handler (lines 81-129):
  - After generating certificate ODTs/PDFs, generate trophy sheet ODTs/PDFs
  - Merge all PDFs with `pypdf.PdfWriter`
  - Return merged PDF

### Modified: `pod/flask/requirements.txt`
- Add `pypdf`

## Verification

1. Select 1st/2nd/3rd place winners on the admin competition page
2. Click "Download Certificates (PDF)"
3. Confirm downloaded PDF has 6 pages in the correct order
4. Confirm pre-filled fields match database values for each winner
5. Confirm date is correct in CST
6. Confirm blank fields are present but empty (not missing)
