"""Simple PDF certificate generation using reportlab."""

import io
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas


def generate_certificate_pdf(
    org_name: str,
    cert_number: str,
    issued_at: datetime,
    expires_at: datetime,
) -> bytes:
    """Generate a simple PDF certificate and return the raw bytes."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width / 2, height - 4 * cm, "Certificate of Registration")

    # Organization name
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, height - 7 * cm, org_name)

    # Certificate number
    c.setFont("Helvetica", 12)
    c.drawCentredString(width / 2, height - 9 * cm, f"Certificate No: {cert_number}")

    # Dates
    c.setFont("Helvetica", 11)
    c.drawCentredString(
        width / 2,
        height - 11 * cm,
        f"Issued: {issued_at.strftime('%Y-%m-%d')}    Expires: {expires_at.strftime('%Y-%m-%d')}",
    )

    # Footer
    c.setFont("Helvetica-Oblique", 9)
    c.drawCentredString(width / 2, 3 * cm, "ProjectsControl Platform")

    c.showPage()
    c.save()
    return buf.getvalue()
