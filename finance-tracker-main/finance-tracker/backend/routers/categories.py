# backend/routers/categories.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=list[schemas.CategoryOut])
def list_categories(type: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Category)
    if type:
        q = q.filter(models.Category.type == type)
    return q.order_by(models.Category.name).all()


@router.post("/", response_model=schemas.CategoryOut, status_code=201)
def create_category(body: schemas.CategoryCreate, db: Session = Depends(get_db)):
    cat = models.Category(**body.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
