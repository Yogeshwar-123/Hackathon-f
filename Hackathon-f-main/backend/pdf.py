import os
from fpdf import FPDF

class InvoicePDF(FPDF):
    def __init__(self, business_name="BizPilot AI Business"):
        super().__init__()
        self.business_name = business_name

    def header(self):
        # Logo or Business Name Banner
        self.set_fill_color(16, 185, 129)  # Emerald green header banner
        self.rect(0, 0, 210, 30, 'F')
        
        self.set_text_color(255, 255, 255)
        self.set_font('helvetica', 'B', 18)
        self.set_xy(10, 8)
        self.cell(0, 10, self.business_name.upper(), border=0, ln=1, align='L')
        
        self.set_font('helvetica', 'B', 14)
        self.set_xy(10, 16)
        self.cell(0, 10, "INVOICE", border=0, ln=1, align='R')
        
        # Reset colors
        self.set_text_color(0, 0, 0)
        self.set_y(35)

    def footer(self):
        self.set_y(-25)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 5, f"Thank you for choosing {self.business_name}!", border=0, ln=1, align='C')
        self.cell(0, 5, f"Page {self.page_no()}/{{nb}}", border=0, ln=0, align='C')

def generate_invoice_pdf(invoice_data, business_name="BizPilot AI"):
    """
    invoice_data: {
        "invoiceNumber": str,
        "clientName": str,
        "issueDate": str,
        "items": [{"name": str, "quantity": int, "price": float}],
        "total": float,
        "subtotal": float,
        "taxAmount": float
    }
    """
    pdf = InvoicePDF(business_name=business_name)
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # Invoice metadata block
    pdf.set_font('helvetica', 'B', 11)
    pdf.set_text_color(70, 70, 70)
    pdf.cell(100, 6, "BILLED TO:", ln=0)
    pdf.cell(0, 6, "INVOICE DETAILS:", ln=1)
    
    pdf.set_font('helvetica', '', 10)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(100, 6, f"Customer: {invoice_data.get('clientName', 'N/A')}", ln=0)
    pdf.cell(0, 6, f"Invoice #: {invoice_data.get('invoiceNumber', 'N/A')}", ln=1)
    
    pdf.cell(100, 6, "", ln=0)
    pdf.cell(0, 6, f"Date: {invoice_data.get('issueDate', 'N/A')}", ln=1)
    pdf.ln(10)
    
    # Table Header
    pdf.set_fill_color(240, 240, 240)
    pdf.set_draw_color(200, 200, 200)
    pdf.set_font('helvetica', 'B', 9)
    
    # Columns: Item Name (100w), Qty (20w), Price (35w), Total (35w) = 190 total width
    pdf.cell(100, 8, "Item Description", border=1, ln=0, align='L', fill=True)
    pdf.cell(20, 8, "Qty", border=1, ln=0, align='C', fill=True)
    pdf.cell(35, 8, "Unit Price", border=1, ln=0, align='R', fill=True)
    pdf.cell(35, 8, "Total", border=1, ln=1, align='R', fill=True)
    
    # Table Content
    pdf.set_font('helvetica', '', 9)
    items = invoice_data.get('items', [])
    for item in items:
        qty = int(item.get('qty', item.get('quantity', 0)))
        price = float(item.get('unit_price', item.get('price', 0)))
        total = qty * price
        
        # Multiline cell wrapper or normal cell if name fits
        name = item.get('name', 'Product')
        if len(name) > 50:
            name = name[:47] + "..."
            
        pdf.cell(100, 8, name, border=1, ln=0, align='L')
        pdf.cell(20, 8, str(qty), border=1, ln=0, align='C')
        pdf.cell(35, 8, f"{price:,.2f}", border=1, ln=0, align='R')
        pdf.cell(35, 8, f"{total:,.2f}", border=1, ln=1, align='R')
    
    pdf.ln(5)
    
    # Totals block
    pdf.set_font('helvetica', 'B', 9)
    # Align to right
    pdf.cell(120, 6, "", ln=0)
    pdf.cell(35, 6, "Subtotal:", border=0, ln=0, align='R')
    subtotal = float(invoice_data.get('subtotal', invoice_data.get('total', 0)))
    pdf.cell(35, 6, f"{subtotal:,.2f}", border=0, ln=1, align='R')
    
    tax_rate = invoice_data.get('taxRate', 18)
    tax_amount = float(invoice_data.get('taxAmount', 0))
    if tax_amount == 0 and tax_rate > 0:
        tax_amount = subtotal * (tax_rate / 100.0)
        
    pdf.cell(120, 6, "", ln=0)
    pdf.cell(35, 6, f"Tax ({tax_rate}%):", border=0, ln=0, align='R')
    pdf.cell(35, 6, f"{tax_amount:,.2f}", border=0, ln=1, align='R')
    
    total = float(invoice_data.get('total', subtotal + tax_amount))
    pdf.set_font('helvetica', 'B', 10)
    pdf.set_fill_color(230, 245, 235)  # Soft green highlight
    pdf.cell(120, 8, "", ln=0)
    pdf.cell(35, 8, "Total:", border=1, ln=0, align='R', fill=True)
    pdf.cell(35, 8, f"{total:,.2f}", border=1, ln=1, align='R', fill=True)
    
    # Ensure static directory exists
    static_dir = os.path.join(os.path.dirname(__file__), "static", "invoices")
    os.makedirs(static_dir, exist_ok=True)
    
    pdf_filename = f"invoice_{invoice_data.get('id', 'temp')}.pdf"
    pdf_path = os.path.join(static_dir, pdf_filename)
    pdf.output(pdf_path)
    
    # Return URL format
    return f"/static/invoices/{pdf_filename}"
