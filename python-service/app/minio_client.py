from minio import Minio
import os
from dotenv import load_dotenv

load_dotenv()


def get_minio_client():
    client = Minio(
        f"{os.getenv('MINIO_ENDPOINT')}:{os.getenv('MINIO_PORT')}",
        access_key=os.getenv('MINIO_ACCESS_KEY'),
        secret_key=os.getenv('MINIO_SECRET_KEY'),
        secure=os.getenv('MINIO_USE_SSL', 'false').lower() == 'true'
    )
    return client


BUCKETS = {
    'TENDERS': 'tcil-tenders',
    'CAREERS': 'tcil-careers',
    'MEDIA': 'tcil-media',
    'REPORTS': 'tcil-reports',
    'SERVICES': 'tcil-services',
    'BANNERS': 'tcil-banners',
}
