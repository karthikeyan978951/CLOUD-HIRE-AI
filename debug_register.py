from app.database import SessionLocal
from app.database import engine
from app.models import Base as ModelsBase
from app.auth import get_password_hash
from app.models import User, Profile

# Ensure DB and tables exist
ModelsBase.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    pw = get_password_hash('Password123')
    print('hashed ok', pw[:30])
    user = User(email='dbguser@example.com', hashed_password=pw)
    db.add(user)
    db.commit()
    db.refresh(user)
    print('created user id', user.id)
    profile = Profile(user_id=user.id, full_name='DbgUser', phone='', bio='')
    db.add(profile)
    db.commit()
    print('profile created')
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
