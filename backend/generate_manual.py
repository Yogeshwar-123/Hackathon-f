import os
from fpdf import FPDF

class ManualPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("helvetica", "B", 8)
            self.set_text_color(150, 150, 150)
            self.cell(0, 10, "BIzPilot AI - Operations Manual", border="B", ln=1, align="R")
            self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", border=0, ln=0, align="C")

def build_pdf():
    pdf = ManualPDF()
    pdf.alias_nb_pages()
    
    # ------------------ COVER PAGE ------------------
    pdf.add_page()
    
    # Large colored header block
    pdf.set_fill_color(99, 102, 241) # Indigo primary accent
    pdf.rect(0, 0, 210, 120, 'F')
    
    # Secondary neon stripe
    pdf.set_fill_color(6, 182, 212) # Cyan accent
    pdf.rect(0, 120, 210, 5, 'F')
    
    # Cover text
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("helvetica", "B", 32)
    pdf.set_xy(20, 45)
    pdf.cell(0, 12, "BIzPilot AI", ln=1)
    
    pdf.set_font("helvetica", "B", 18)
    pdf.cell(0, 10, "Operations & Administration Manual", ln=1)
    
    pdf.set_font("helvetica", "I", 12)
    pdf.set_text_color(220, 220, 220)
    pdf.cell(0, 10, "Retro-Future MSME Operations Copilot", ln=1)
    
    # Cover footer info
    pdf.set_text_color(80, 80, 80)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_xy(20, 220)
    pdf.cell(0, 5, "TECHNICAL SPECIFICATION & DOCUMENTATION", ln=1)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(110, 110, 110)
    pdf.cell(0, 5, "Author: BIzPilot AI Core Team", ln=1)
    pdf.cell(0, 5, "Target Platform: MSMEs, Wholesale & Retail Operations", ln=1)
    pdf.cell(0, 5, "Date: July 2026", ln=1)
    
    # ------------------ SYSTEM OVERVIEW ------------------
    pdf.add_page()
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("helvetica", "B", 16)
    pdf.set_text_color(99, 102, 241)
    pdf.cell(0, 10, "1. System Architecture Overview", ln=1)
    pdf.ln(3)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(30, 30, 30)
    
    overview_text = (
        "BIzPilot is an all-in-one operations cockpit designed for Micro, Small, and Medium "
        "Enterprises (MSMEs). It automates bookkeeping, inventory, workforce wage settlements, and "
        "provides real-time reporting via a modern, high-fidelity developer dashboard styling.\n\n"
        "The system runs on a modern decoupled architecture:"
    )
    pdf.multi_cell(0, 6, overview_text)
    pdf.ln(3)
    
    # Component Bullets
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(10, 6, "1.", ln=0)
    pdf.cell(0, 6, "React Frontend (Vite + TailwindCSS v4)", ln=1)
    pdf.set_font("helvetica", "", 10)
    pdf.multi_cell(0, 5, "Renders charts (Recharts), manages visual visual themes, local user states, and handles Google Sign-In with Firebase client configurations.")
    pdf.ln(2)
    
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(10, 6, "2.", ln=0)
    pdf.cell(0, 6, "FastAPI Backend (Python)", ln=1)
    pdf.set_font("helvetica", "", 10)
    pdf.multi_cell(0, 5, "Coordinates API routes, invokes Google Gemini models for invoice OCR extraction & daily summaries, and compiles professional invoice PDFs.")
    pdf.ln(2)
    
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(10, 6, "3.", ln=0)
    pdf.cell(0, 6, "Dual Database Persistence Layer", ln=1)
    pdf.set_font("helvetica", "", 10)
    pdf.multi_cell(0, 5, "Supports MongoDB via connection string (DATABASE_URL) for production operations. If unconfigured, automatically falls back to an offline local file database (backend/data_db.json).")
    
    # ------------------ REQUIRED CREDENTIALS ------------------
    pdf.ln(10)
    pdf.set_font("helvetica", "B", 16)
    pdf.set_text_color(99, 102, 241)
    pdf.cell(0, 10, "2. Required API Credentials & Secrets", ln=1)
    pdf.ln(3)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(30, 30, 30)
    pdf.multi_cell(0, 6, "To run 100% of the copilot features, the following environment secrets and files must be configured:")
    pdf.ln(3)
    
    # Draw simple table for API credentials
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font("helvetica", "B", 9)
    pdf.cell(50, 7, "API Key / Config", border=1, ln=0, fill=True)
    pdf.cell(40, 7, "Location", border=1, ln=0, fill=True)
    pdf.cell(100, 7, "Purpose", border=1, ln=1, fill=True)
    
    pdf.set_font("helvetica", "", 9)
    pdf.cell(50, 7, "GEMINI_API_KEY", border=1, ln=0)
    pdf.cell(40, 7, ".env / backend/.env", border=1, ln=0)
    pdf.cell(100, 7, "Powers Gemini 2.5 Flash OCR parsing & advice.", border=1, ln=1)
    
    pdf.cell(50, 7, "firebase-applet-config.json", border=1, ln=0)
    pdf.cell(40, 7, "Project Root", border=1, ln=0)
    pdf.cell(100, 7, "Authenticates Google Sign-In & backup sessions.", border=1, ln=1)
    
    pdf.cell(50, 7, "DATABASE_URL", border=1, ln=0)
    pdf.cell(40, 7, "backend/.env", border=1, ln=0)
    pdf.cell(100, 7, "MongoDB connection (Optional fallback to local file).", border=1, ln=1)
    
    # ------------------ INSTRUCTIONS & GUIDE ------------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 16)
    pdf.set_text_color(99, 102, 241)
    pdf.cell(0, 10, "3. Core Features & Operations Guide", ln=1)
    pdf.ln(3)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(30, 30, 30)
    
    # Invoicing
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(6, 182, 212)
    pdf.cell(0, 8, "A. Professional Invoicing & Receipt OCR", ln=1)
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(30, 30, 30)
    pdf.multi_cell(0, 6, (
        "Under 'Billing & Invoices', operators can generate invoices manually or upload an image "
        "snapshot/PDF receipt of a vendor bill. Gemini extracts structured data automatically. "
        "Upon submission, the system generates a printable PDF receipt and commits the transaction "
        "directly to the financial statement ledger."
    ))
    pdf.ln(3)
    
    # Inventory
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(6, 182, 212)
    pdf.cell(0, 8, "B. Inventory safety Watchlist", ln=1)
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(30, 30, 30)
    pdf.multi_cell(0, 6, (
        "Under 'Inventory', products can be registered with active cost, pricing, stock levels, "
        "and restock safety limits. If quantities drop below the safety limit, the dashboard "
        "automatically issues a reorder alert."
    ))
    pdf.ln(3)
    
    # Workforce
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(6, 182, 212)
    pdf.cell(0, 8, "C. Installer Workforce & Payroll", ln=1)
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(30, 30, 30)
    pdf.multi_cell(0, 6, (
        "Under 'Staff & Wages', operators can log worker details, daily attendance, and assign "
        "work hours. Payroll balances are calculated automatically and can be settled on-demand, "
        "adding the payout log as an outflow transaction."
    ))
    
    # ------------------ PDF EXPORT PURPOSE ------------------
    pdf.ln(8)
    pdf.set_font("helvetica", "B", 16)
    pdf.set_text_color(99, 102, 241)
    pdf.cell(0, 10, "4. The Purpose & Benefits of PDF Formats", ln=1)
    pdf.ln(3)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(30, 30, 30)
    pdf_purpose = (
        "Standardized PDF documents generated by BIzPilot serve as critical business artifacts:\n\n"
        "- Immutable Record Keeping: Static invoice files act as historical audit trails for tax compliance.\n"
        "- Portability & Distribution: Easily shared with customers via WhatsApp, email, or Slack.\n"
        "- Offline Accessibility: PDF files are stored inside 'backend/static/invoices/' and remain "
        "accessible even without an active internet connection."
    )
    pdf.multi_cell(0, 6, pdf_purpose)
    
    # Create static directory if missing and output PDF
    static_dir = os.path.join("backend", "static")
    os.makedirs(static_dir, exist_ok=True)
    output_path = os.path.join(static_dir, "bizpilot_manual.pdf")
    pdf.output(output_path)
    print(f"Manual PDF compiled successfully at: {output_path}")

if __name__ == "__main__":
    build_pdf() 
