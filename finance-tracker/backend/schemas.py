# backend/schemas.py
from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class AccountCreate(BaseModel):
    name:     str
    type:     str
    balance:  Decimal = Decimal("0")
    currency: str = "USD"
    color:    str = "#6366f1"

class AccountUpdate(BaseModel):
    name:     Optional[str]     = None
    type:     Optional[str]     = None
    balance:  Optional[Decimal] = None
    color:    Optional[str]     = None

class AccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; name: str; type: str; balance: Decimal
    currency: str; color: str; created_at: datetime


class CategoryCreate(BaseModel):
    name: str; type: str; colour: str = "#94a3b8"; icon: Optional[str] = None

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; name: str; type: str; colour: str; icon: Optional[str]


class TransactionCreate(BaseModel):
    account_id:  int
    category_id: Optional[int] = None
    amount:      Decimal
    type:        str
    description: Optional[str] = None
    date:        date
    notes:       Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Decimal) -> Decimal:
        if v <= 0: raise ValueError("amount must be positive")
        return v

    @field_validator("type")
    @classmethod
    def type_valid(cls, v: str) -> str:
        if v not in ("income", "expense", "transfer"):
            raise ValueError("type must be income, expense, or transfer")
        return v

class TransactionUpdate(BaseModel):
    account_id:  Optional[int]     = None
    category_id: Optional[int]     = None
    amount:      Optional[Decimal] = None
    type:        Optional[str]     = None
    description: Optional[str]     = None
    date:        Optional[date]    = None
    notes:       Optional[str]     = None

class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; account_id: int; category_id: Optional[int]
    amount: Decimal; type: str; description: Optional[str]
    date: date; notes: Optional[str]; created_at: datetime
    account: AccountOut; category: Optional[CategoryOut]

class TransactionBulkCreate(BaseModel):
    transactions: list[TransactionCreate]


class BudgetCreate(BaseModel):
    category_id: int; amount: Decimal; month: date

    @field_validator("month")
    @classmethod
    def first_day(cls, v: date) -> date:
        return v.replace(day=1)

class BudgetUpdate(BaseModel):
    amount: Decimal

class BudgetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; category_id: int; amount: Decimal; month: date; category: CategoryOut

class BudgetProgress(BaseModel):
    budget_id: int; category: str; colour: str
    budgeted: float; spent: float; remaining: float; pct: float


class MonthlySummary(BaseModel):
    month: int; income: float; expenses: float; net: float

class CategorySpend(BaseModel):
    category_id: Optional[int]; category: str; colour: str; total: float; pct: float
