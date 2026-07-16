import os
import json
import logging
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger("bizpilot_ai")

# Initialize the Gemini GenAI client
# It automatically reads GEMINI_API_KEY from environment variables
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key:
    try:
        client = genai.Client(api_key=api_key)
        logger.info("Gemini GenAI client initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing Gemini client: {e}")
else:
    logger.warn("GEMINI_API_KEY not found in environment. AI operations will use fallbacks.")

def extract_bill_from_image(image_bytes: bytes, mime_type: str) -> dict:
    """
    Sends receipt/bill image to Gemini 2.5 Flash for extraction.
    Returns: {vendor, date, items: [{name, qty, unit_price}], total}
    """
    if not client:
        logger.warn("Gemini client is not available. Using fallback empty draft.")
        return get_fallback_extraction()

    prompt = (
        "Analyze this bill/receipt image and extract key details. "
        "Return a JSON object containing the following keys:\n"
        "- vendor: Name of the merchant or service provider (string)\n"
        "- date: Date on the receipt in YYYY-MM-DD format (string)\n"
        "- items: List of items purchased, where each item has:\n"
        "  * name: Name or description of the product/service (string)\n"
        "  * qty: Quantity purchased (integer)\n"
        "  * unit_price: Price per unit (number)\n"
        "- total: The grand total amount on the receipt (number)\n\n"
        "Make sure to extract as many line items as possible. Return valid JSON only."
    )

    try:
        logger.info(f"Sending image to Gemini 2.5 Flash for OCR extraction. Mime type: {mime_type}...")
        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[image_part, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        
        # Parse the JSON response
        text_response = response.text.strip()
        logger.info(f"Gemini response: {text_response}")
        extracted_data = json.loads(text_response)
        
        # Clean up keys and items to match exact structure
        cleaned_data = {
            "vendor": extracted_data.get("vendor", "Unknown Vendor"),
            "date": extracted_data.get("date", ""),
            "items": [],
            "total": float(extracted_data.get("total", 0))
        }
        
        raw_items = extracted_data.get("items", [])
        for item in raw_items:
            cleaned_data["items"].append({
                "name": item.get("name", "Product"),
                "qty": int(item.get("qty", 1)),
                "unit_price": float(item.get("unit_price", 0))
            })
            
        return cleaned_data

    except Exception as e:
        logger.error(f"Gemini vision call failed: {e}. Returning manual fallback draft.")
        return get_fallback_extraction()

def generate_report_recommendations(sales_summary: dict) -> list:
    """
    Phrases recommendation insights based on computed business aggregates.
    """
    if not client:
        return get_fallback_recommendations(sales_summary)

    prompt = (
        f"You are BizPilot AI, an expert business copilot. Based on the daily sales summary below, "
        "provide 1 or 2 concise, action-oriented, and specific recommendations in bullet points. "
        "Do NOT make up any numbers; use only the facts provided. Return a JSON list of strings.\n\n"
        f"Daily Sales Summary:\n"
        f"- Total Revenue: {sales_summary.get('revenue', 0)}\n"
        f"- Total Units Sold: {sales_summary.get('units_sold', 0)}\n"
        f"- Total Stock Added (Restocked): {sales_summary.get('stock_added', 0)}\n"
        f"- Top Products Sold: {sales_summary.get('top_products', [])}\n"
        f"- Low Stock Items: {sales_summary.get('low_stock_items', [])}\n"
    )

    try:
        logger.info("Requesting recommendations from Gemini...")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.7
            )
        )
        text_response = response.text.strip()
        logger.info(f"Gemini recommendations: {text_response}")
        recommendations = json.loads(text_response)
        if isinstance(recommendations, list):
            return [str(r) for r in recommendations]
        return get_fallback_recommendations(sales_summary)
    except Exception as e:
        logger.error(f"Gemini recommendation failed: {e}. Returning fallback list.")
        return get_fallback_recommendations(sales_summary)

def get_fallback_extraction() -> dict:
    return {
        "vendor": "",
        "date": "",
        "items": [{"name": "", "qty": 1, "unit_price": 0}],
        "total": 0
    }

def get_fallback_recommendations(sales_summary: dict) -> list:
    low_stock = sales_summary.get('low_stock_items', [])
    top_products = sales_summary.get('top_products', [])
    
    recommendations = []
    if low_stock:
        recommendations.append(f"Stock levels are low for: {', '.join(low_stock[:3])}. Create a restock request to prevent stock-outs.")
    else:
        recommendations.append("All core stock levels are currently healthy. Continue monitoring sales velocity.")
        
    if top_products:
        recommendations.append(f"High demand noticed for: {', '.join(top_products[:2])}. Ensure suppliers can cover next week's moving average.")
    else:
        recommendations.append("Sales are steady. Monitor daily trends to identify high-performing products.")
        
    return recommendations
