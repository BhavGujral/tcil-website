from PIL import Image
import io
import os
from app.minio_client import get_minio_client, BUCKETS
from app.database import get_db_connection


def create_thumbnail(image_bytes, width=400, height=300):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        img.thumbnail((width, height), Image.LANCZOS)
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=85)
        output.seek(0)
        return output.getvalue()
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        return None


def process_gallery_image(gallery_id, file_key):
    try:
        print(f"Processing gallery image: {file_key}")
        minio = get_minio_client()
        response = minio.get_object(BUCKETS['MEDIA'], file_key)
        image_bytes = response.read()
        response.close()
        thumbnail_bytes = create_thumbnail(image_bytes)
        if not thumbnail_bytes:
            return False
        parts = file_key.rsplit('/', 1)
        if len(parts) == 2:
            thumb_key = f"{parts[0]}/thumbs/{parts[1]}"
        else:
            thumb_key = f"thumbs/{file_key}"
        thumb_key = thumb_key.rsplit('.', 1)[0] + '.jpg'
        minio.put_object(
            BUCKETS['MEDIA'],
            thumb_key,
            io.BytesIO(thumbnail_bytes),
            length=len(thumbnail_bytes),
            content_type='image/jpeg'
        )
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE media_gallery SET thumb_key = %s WHERE id = %s",
            (thumb_key, gallery_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Thumbnail created: {thumb_key}")
        return True
    except Exception as e:
        print(f"❌ Error processing image: {e}")
        return False


def process_banner_image(banner_id, file_key):
    try:
        minio = get_minio_client()
        response = minio.get_object(BUCKETS['BANNERS'], file_key)
        image_bytes = response.read()
        response.close()
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        img = img.resize((1920, 600), Image.LANCZOS)
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=90)
        output.seek(0)
        optimized_bytes = output.getvalue()
        minio.put_object(
            BUCKETS['BANNERS'],
            file_key,
            io.BytesIO(optimized_bytes),
            length=len(optimized_bytes),
            content_type='image/jpeg'
        )
        print(f"✅ Banner optimized: {file_key}")
        return True
    except Exception as e:
        print(f"❌ Error processing banner: {e}")
        return False
