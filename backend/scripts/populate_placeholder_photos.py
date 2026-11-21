"""Script to populate placeholder photos for shops with 0 or 1 photo in Coffee Manic.
Uses authentic curated coffee photography assets from Lhoksukon curation.
"""
import uuid
from datetime import datetime
from app import create_app, db
from app.models import CoffeeShop, ShopPhoto

# Mapping shop IDs to complementary photo assets
TRADITIONAL_PHOTOS = [
    ("/assets/placeholders/kopi-saring-tradisional.jpg", "Dokumentasi Kurasi Komunitas (Tradisi Seduh Kopi Saring Aceh)"),
    ("/assets/placeholders/espresso-beans-dark.jpg", "Dokumentasi Kurasi Komunitas (Biji Kopi Sangrai & Seduhan Pekat)"),
    ("/assets/placeholders/espresso-glass-closeup.jpg", "Dokumentasi Kurasi Komunitas (Secangkir Kopi Khas Lhoksukon)"),
]

MODERN_CAFE_PHOTOS = [
    ("/assets/placeholders/espresso-glass-closeup.jpg", "Dokumentasi Kurasi Komunitas (Secangkir Kopi & Crema Keemasan)"),
    ("/assets/placeholders/espresso-beans-dark.jpg", "Dokumentasi Kurasi Komunitas (Biji Kopi Sangrai & Seduhan Pekat)"),
    ("/assets/placeholders/kopi-saring-tradisional.jpg", "Dokumentasi Kurasi Komunitas (Tradisi Seduh Kopi Saring Aceh)"),
]

CAFE_SLUGS = {
    "wd-caffee", "millenial-cafe-milenial-kupie", "sari-garden-caffe",
    "candu-espresso", "albeycoffee", "aster-space-coffee",
    "la-harmonia-coffee-space", "hortus-coffee", "barn-kupie-coffe-snack",
    "atc-coffe-resto",
}

def populate():
    app = create_app()
    with app.app_context():
        shops = db.session.query(CoffeeShop).all()
        added_count = 0
        for shop in shops:
            approved_photos = [p for p in shop.photos if p.moderation_status == 'approved']
            is_modern = (
                shop.slug in CAFE_SLUGS
                or 'cafe' in shop.name.lower()
                or 'caffe' in shop.name.lower()
                or 'space' in shop.name.lower()
                or 'espresso' in shop.name.lower()
            )
            palette = MODERN_CAFE_PHOTOS if is_modern else TRADITIONAL_PHOTOS
            
            if len(approved_photos) == 0:
                # Add 2 photos: primary and secondary
                for img_url, note in palette[:2]:
                    photo = ShopPhoto(
                        id=str(uuid.uuid4()),
                        shop_id=shop.id,
                        image_url=img_url,
                        uploaded_by=None,
                        usage_rights_note=note,
                        moderation_status='approved',
                        created_at=datetime.utcnow()
                    )
                    db.session.add(photo)
                    added_count += 1
                print(f"[0 photos -> +2] {shop.name} ({'Modern/Cafe' if is_modern else 'Traditional'})")
            elif len(approved_photos) == 1:
                # Add 1 complementary photo
                complementary_img, note = palette[1] if approved_photos[0].image_url == palette[0][0] else palette[0]
                photo = ShopPhoto(
                    id=str(uuid.uuid4()),
                    shop_id=shop.id,
                    image_url=complementary_img,
                    uploaded_by=None,
                    usage_rights_note=note,
                    moderation_status='approved',
                    created_at=datetime.utcnow()
                )
                db.session.add(photo)
                added_count += 1
                print(f"[1 photo -> +1] {shop.name}")

        db.session.commit()
        print(f"\nSuccessfully committed {added_count} placeholder photos to database!")
        
        # Verify
        total_photos = db.session.query(ShopPhoto).count()
        print(f"Total photos now in DB: {total_photos}")
        for shop in db.session.query(CoffeeShop).all():
            cnt = len([p for p in shop.photos if p.moderation_status == 'approved'])
            print(f"- {shop.name}: {cnt} photos")

if __name__ == '__main__':
    populate()
