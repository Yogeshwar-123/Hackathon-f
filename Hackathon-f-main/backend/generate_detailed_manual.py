import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class DetailedManualPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("helvetica", "B", 8)
            self.set_text_color(150, 150, 150)
            self.cell(0, 10, "BIzPilot AI - Step-by-Step Operations Manual", border="B", 
                      new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")
            self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", border=0, align="C")

def build_pdf():
    pdf = DetailedManualPDF()
    pdf.alias_nb_pages()
    
    # ------------------ COVER PAGE ------------------
    pdf.add_page()
    
    # Dark high-tech header block
    pdf.set_fill_color(8, 17, 13) # Obsidian green
    pdf.rect(0, 0, 210, 130, 'F')
    
    # Accent neon line
    pdf.set_fill_color(16, 185, 129) # Emerald neon
    pdf.rect(0, 130, 210, 4, 'F')
    
    # Cover text
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("helvetica", "B", 36)
    pdf.set_xy(20, 45)
    pdf.cell(0, 14, "BIzPilot AI", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_font("helvetica", "B", 18)
    pdf.set_text_color(200, 240, 220)
    pdf.cell(0, 10, "High-Fidelity Operations Manual", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_font("helvetica", "I", 11)
    pdf.set_text_color(160, 160, 160)
    pdf.cell(0, 8, "A Complete Step-by-Step Walkthrough of All Cockpit Modules", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    # Info block
    pdf.set_text_color(80, 80, 80)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_xy(20, 210)
    pdf.cell(0, 5, "PRODUCT GUIDE & USER INTERFACE MANUAL", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 5, "Scope: Billing, Invoicing, Inventory, Workforce & AI Copilot", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 5, "Database Config: MongoDB / JSON File System", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 5, "Visual Styles: Cosmic, Emerald, Copper, Lagoon", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 5, "Release Version: v1.5", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # ------------------ TABLE OF CONTENTS ------------------
    pdf.add_page()
    pdf.set_text_color(16, 185, 129)
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 12, "Table of Contents", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(5)
    
    pdf.set_font("helvetica", "", 11)
    pdf.set_text_color(50, 50, 50)
    
    toc_items = [
        ("1. Introduction & Basic Interface Anatomy", 3),
        ("2. Visual Theme Switcher & CRT Graphics Mode", 3),
        ("3. Executive Dashboard (KPI Grid & Analytical Charts)", 4),
        ("4. Inventory Catalog (SKU Management & Reorders)", 4),
        ("5. Billing & Invoices (New Invoice Form & Vision OCR)", 5),
        ("6. Staff & Wages (Attendance Logging & Payroll Settlement)", 6),
        ("7. Client Database (Installers & subcontract Partners)", 6),
        ("8. Settings Configuration (Currency & Organization)", 7),
        ("9. Backup Engine (Google Drive Integration)", 7)
    ]
    
    for item, page in toc_items:
        pdf.cell(160, 8, item, border="B", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(0, 8, f"Page {page}", border="B", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")
        pdf.ln(2)

    # ------------------ SECTION 1 & 2 ------------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(16, 185, 129)
    pdf.cell(0, 10, "1. Introduction & Basic Interface Anatomy", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    
    intro_txt = (
        "BIzPilot is configured as an Operations Cockpit, organizing all business administration "
        "tasks into specialized, high-performance visual blocks. The screen layout is logically "
        "divided into three floating components designed to maximize visibility:\n\n"
        "- Left Sidebar: Used to toggle between the platform's core functional modules (Dashboard, "
        "AI Copilot, Billing, Inventory, Reports, Staff, Customers, Settings). It also renders "
        "active verification credentials (like Firebase state) and a logout trigger.\n\n"
        "- Top Header Bar: Renders live health indicators, warnings (such as low stock alerts), "
        "the notification fly-out drawer, a CRT mode toggle, and quick guide panels.\n\n"
        "- Main Canvas: The large central stage where dynamic listings, analytics cards, document "
        "composers, and input forms are rendered."
    )
    pdf.multi_cell(0, 5.5, intro_txt)
    pdf.ln(6)
    
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(16, 185, 129)
    pdf.cell(0, 10, "2. Visual Theme Switcher & CRT Graphics Mode", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    theme_txt = (
        "Operators can customize their visual experience to match their work environments. BIzPilot "
        "includes a responsive theme widget and a vintage CRT display filter:\n\n"
        "- Theme Swapping: Located on the Dashboard banner. Choose between Cosmic Midnight "
        "(Indigo/Purple), Royal Emerald (Jade/Green), Sunset Copper (Obsidian/Amber), or Oceanic "
        "Lagoon (Navy/Teal). Switching updates backgrounds, glows, active borders, and chart colors.\n\n"
        "- CRT Mode: Located in the Top Header. Clicking it overlay scanlines, flicker animations, "
        "and a radial vignette, rendering a high-contrast vintage terminal style."
    )
    pdf.multi_cell(0, 5.5, theme_txt)

    # ------------------ SECTION 3 & 4 ------------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(16, 185, 129)
    pdf.cell(0, 10, "3. Executive Dashboard Overview", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    
    dash_txt = (
        "The Dashboard serves as the central operational hub. It aggregates ledger data "
        "to display real-time performance indicators:\n\n"
        "- KPI Grid: Displays Gross Revenue (all inflows), Total Outflows (all materials, wages, and expenses), "
        "Net Profit Margin (calculated dynamically with percentage profitability indicators), and Pending Collection "
        "(outstanding invoice amounts).\n\n"
        "- Analytical Charts: Renders a dual-axis Area Chart showing daily cashflow trends and a custom Pie Chart "
        "illustrating category-based expense distributions.\n\n"
        "- Reorder Watchlist: Scans product stock levels and displays items breaching reorder thresholds with "
        "one-click 'Manage Stock' actions."
    )
    pdf.multi_cell(0, 5.5, dash_txt)
    pdf.ln(6)
    
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(16, 185, 129)
    pdf.cell(0, 10, "4. Inventory Catalog (SKU Management)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    inv_txt = (
        "This section tracks physical product stocks. To add a product, follow these steps:\n\n"
        "1. Click 'Inventory' in the Left Sidebar to open the catalog canvas.\n"
        "2. Click the '+ Add Solar Product' button to slide open the registration form.\n"
        "3. Enter the following parameters:\n"
        "   * Product Name (e.g., '450W Mono Solar Panel')\n"
        "   * SKU/Model (e.g., 'SP-450-MB')\n"
        "   * Category (choose from 'Solar Panels', 'Inverters', 'Batteries', etc.)\n"
        "   * Current Quantity (initial units on hand)\n"
        "   * Unit Cost (purchase cost per unit)\n"
        "   * Selling Price (retail/wholesale pricing)\n"
        "   * Minimum Stock (safety reorder threshold)\n"
        "4. Click 'Save Product'. This saves the SKU and logs a 'Stock Added' entry."
    )
    pdf.multi_cell(0, 5.5, inv_txt)

    # ------------------ SECTION 5 ------------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(16, 185, 129)
    pdf.cell(0, 10, "5. Billing & Invoices (Manual & AI OCR)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    
    invoice_intro = (
        "Under the 'Billing & Invoices' tab, operators draft customer invoices, track collections, "
        "and leverage the Gemini AI engine to extract physical receipt data."
    )
    pdf.multi_cell(0, 5.5, invoice_intro)
    pdf.ln(4)
    
    # Manual billing steps
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(6, 182, 212)
    pdf.cell(0, 8, "How to Manually Draft an Invoice:", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    
    manual_steps = (
        "1. Click the 'Invoices' tab on the sidebar, and click '+ New Invoice'.\n"
        "2. Select the Billed Customer from the dropdown menu (synced from the Customers database).\n"
        "3. Specify the Invoice Number, Issue Date, and select the payment status ('Paid' or 'Unpaid').\n"
        "4. Add line items: Select products from the dropdown, enter quantity. The system automatically "
        "pulls the selling price and calculates line-item sub-totals.\n"
        "5. Adjust Tax Configurations (e.g. 18% GST/VAT). The system automatically calculates tax amount "
        "and total values.\n"
        "6. Click 'Create Invoice'. A clean, official transaction PDF is generated, and a ledger "
        "inflow is posted."
    )
    pdf.multi_cell(0, 5.5, manual_steps)
    pdf.ln(4)
    
    # AI OCR Upload steps
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(6, 182, 212)
    pdf.cell(0, 8, "How to Extract Data via AI OCR Image Upload:", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    
    ocr_steps = (
        "1. Locate the 'Upload Receipt image for AI OCR Extraction' box inside the New Invoice editor.\n"
        "2. Drag and drop or browse to select a JPEG, PNG, or PDF file of a physical bill/receipt.\n"
        "3. The system uploads the raw file and invokes Gemini 2.5 Flash. The model extracts key parameters: "
        "Vendor Name, Receipt Date, Individual line items (Description, Quantity, Unit Price), and Total amount.\n"
        "4. The system pre-fills the invoice composer form with these details in under 3 seconds.\n"
        "5. Review, adjust any parameters if needed, and click 'Confirm & Save' to write it to database."
    )
    pdf.multi_cell(0, 5.5, ocr_steps)

    # ------------------ SECTION 6, 7 & 8 ------------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(16, 185, 129)
    pdf.cell(0, 10, "6. Staff & Wages (Payroll Administration)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    
    staff_txt = (
        "BIzPilot includes a workforce attendance and payroll settlement block. To manage team logs:\n\n"
        "1. Onboarding: Click 'Add Employee'. Input name, email, operational role, and daily wage rate.\n"
        "2. Log Attendance: Use the attendance form to select a worker, enter the date, check status "
        "('Present' or 'Absent'), and specify work hours. The system computes daily earnings based on "
        "hours worked and wage rates.\n"
        "3. Wage Settlements: In the 'Wages Summary' table, click the 'Settle Wages' button next to an "
        "employee to clear outstanding balances. This records a cash outflow transaction in the ledger."
    )
    pdf.multi_cell(0, 5.5, staff_txt)
    pdf.ln(6)
    
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(16, 185, 129)
    pdf.cell(0, 10, "7. Client Database (Subcontractors & Partners)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    client_txt = (
        "Track contact details and project locations under the 'Customers' tab:\n\n"
        "- Register Clients: Click '+ Add Partner'. Input Business Name, primary email, contact phone, "
        "and physical installation address. Registered partners appear in invoice dropdowns automatically."
    )
    pdf.multi_cell(0, 5.5, client_txt)
    pdf.ln(6)
    
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(16, 185, 129)
    pdf.cell(0, 10, "8. Settings & Configurations", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    settings_txt = (
        "To manage visual styles and currencies, go to 'Settings' on the sidebar:\n\n"
        "- Modify Parameters: Edit Operator Name, registered email, and business name.\n"
        "- Localized Currencies: Choose preferred currency codes (INR, USD, EUR, etc.) to format dashboard numbers.\n"
        "- Save: Click 'Synchronize Parameters' to update database configs."
    )
    pdf.multi_cell(0, 5.5, settings_txt)

    # ------------------ SECTION 9 ------------------
    pdf.add_page()
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(16, 185, 129)
    pdf.cell(0, 10, "9. Backup Engine (Google Drive Backups)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    pdf.set_font("helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    
    backup_txt = (
        "To prevent accidental data loss, BIzPilot integrates with Google Drive to store and "
        "retrieve database snapshots. To manage backups, go to the 'Backups' view:\n\n"
        "- Creating a Backup: Click 'Backup Now'. The system packages the local JSON database "
        "and uploads the snapshot directly to your personal Google Drive account inside a folder "
        "named 'BizPilot Backups'.\n\n"
        "- Restoring a Backup: Under 'Available Backups', click 'Restore' next to a snapshot. The "
        "system downloads the JSON payload and overrides the active database state."
    )
    pdf.multi_cell(0, 5.5, backup_txt)
    pdf.ln(12)
    
    # Conclusion footer block
    pdf.set_fill_color(240, 248, 245)
    pdf.set_draw_color(16, 185, 129)
    pdf.set_text_color(8, 17, 13)
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(0, 12, "  END OF OPERATIONAL MANUAL - BIZPILOT AI", border=1, fill=True, align="L")
    
    # Save PDF
    static_dir = os.path.join("backend", "static")
    os.makedirs(static_dir, exist_ok=True)
    output_path = os.path.join(static_dir, "bizpilot_detailed_manual.pdf")
    pdf.output(output_path)
    print(f"Detailed Manual PDF compiled successfully at: {output_path}")

if __name__ == "__main__":
    build_pdf()
