from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

celery_app = Celery(
    'tcil_tasks',
    broker=os.getenv('REDIS_URL', 'redis://redis:6379'),
    backend=os.getenv('REDIS_URL', 'redis://redis:6379')
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Kolkata',
    enable_utc=True,
)


@celery_app.task(name='process_tender_pdf')
def task_process_tender_pdf(tender_id, pdf_key):
    from app.pdf_processor import process_tender_pdf
    return process_tender_pdf(tender_id, pdf_key)


@celery_app.task(name='process_career_pdf')
def task_process_career_pdf(career_id, pdf_key):
    from app.pdf_processor import process_career_pdf
    return process_career_pdf(career_id, pdf_key)


@celery_app.task(name='process_gallery_image')
def task_process_gallery_image(gallery_id, file_key):
    from app.image_processor import process_gallery_image
    return process_gallery_image(gallery_id, file_key)


@celery_app.task(name='process_banner_image')
def task_process_banner_image(banner_id, file_key):
    from app.image_processor import process_banner_image
    return process_banner_image(banner_id, file_key)
