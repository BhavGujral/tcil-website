import fitz
import io
import os
from app.minio_client import get_minio_client, BUCKETS
from app.database import get_db_connection


def extract_text_from_pdf(pdf_bytes):
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            full_text += page.get_text() + "\n"
        doc.close()
        return full_text.strip()
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""


def process_tender_pdf(tender_id, pdf_key):
    try:
        print(f"Processing tender PDF: {pdf_key}")
        minio = get_minio_client()
        response = minio.get_object(BUCKETS['TENDERS'], pdf_key)
        pdf_bytes = response.read()
        response.close()
        extracted_text = extract_text_from_pdf(pdf_bytes)
        if not extracted_text:
            return False
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE tenders SET description_en = COALESCE(description_en, '') || %s WHERE id = %s",
            (extracted_text[:5000], tender_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Tender PDF processed: {tender_id}")
        return True
    except Exception as e:
        print(f"❌ Error processing tender PDF: {e}")
        return False


def process_career_pdf(career_id, pdf_key):
    try:
        print(f"Processing career PDF: {pdf_key}")
        minio = get_minio_client()
        response = minio.get_object(BUCKETS['CAREERS'], pdf_key)
        pdf_bytes = response.read()
        response.close()
        extracted_text = extract_text_from_pdf(pdf_bytes)
        if extracted_text:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE career_openings SET qualification = COALESCE(qualification, '') || %s WHERE id = %s",
                (extracted_text[:3000], career_id)
            )
            conn.commit()
            cursor.close()
            conn.close()
        print(f"✅ Career PDF processed: {career_id}")
        return True
    except Exception as e:
        print(f"❌ Error processing career PDF: {e}")
        return False
