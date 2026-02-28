
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True

class ResourceBase(BaseModel):
    name: str
    type: str
    cost_per_hour: float
    max_capacity: int
    current_load: float
    status: str

class Resource(ResourceBase):
    id: int

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    priority: int
    estimated_time: float
    status: str

class TaskCreate(TaskBase):
    user_id: Optional[int] = None

class Task(TaskBase):
    id: int
    assigned_resource_id: Optional[int]
    user_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class MetricBase(BaseModel):
    cpu_load: float
    memory_load: float
    latency: float

class Metric(MetricBase):
    id: int
    resource_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True
