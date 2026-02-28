
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uvicorn
import asyncio
import random
import json
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from . import models, schemas, auth, crud, ml_engine, database, websocket_manager

# --- Background Simulation ---
async def simulate_system_load():
    """Simulates changing load on resources and broadcasts updates via WebSocket."""
    while True:
        await asyncio.sleep(3) # Update every 3 seconds
        
        db = database.SessionLocal()
        try:
            resources = db.query(models.Resource).all()
            if not resources:
                continue

            updated_resources = []
            for res in resources:
                # Simulate load change
                delta = (random.random() - 0.5) * 10
                new_load = max(0, min(100, res.current_load + delta))
                
                # Update status based on load
                status_str = "NORMAL"
                if new_load > 90:
                    status_str = "CRITICAL"
                elif new_load > 75:
                    status_str = "HIGH_LOAD"
                
                res.current_load = round(new_load, 1)
                res.status = status_str
                
                # Update metrics history (optional, or just broadcast current state)
                # In a real app, we'd save to Metric table here
                
                updated_resources.append({
                    "id": res.id, # Send ID as integer or string? Frontend expects string "res-1", backend has int.
                                  # We might need to map or just use int id in frontend.
                    "name": res.name,
                    "type": res.type,
                    "costPerHour": res.cost_per_hour,
                    "maxCapacity": res.max_capacity,
                    "currentLoad": res.current_load,
                    "status": res.status,
                    "metrics": { # Simulate other metrics
                        "cpu": round(new_load),
                        "memory": round(max(0, min(100, new_load + (random.random() - 0.5) * 20))),
                        "latency": round(max(5, new_load * 2 + (random.random() * 20)))
                    }
                })
            
            db.commit()
            
            # Broadcast
            message = {
                "type": "LOAD_UPDATE",
                "data": updated_resources 
            }
            await websocket_manager.manager.broadcast(json.dumps(message))
            
            # Simulate Anomaly
            if random.random() > 0.95:
                # Pick a random resource
                res = random.choice(updated_resources)
                if res['currentLoad'] > 80:
                     anomaly = {
                        "type": "ANOMALY_DETECTED",
                        "data": {
                            "id": str(random.randint(1000, 9999)),
                            "resourceId": res['id'],
                            "type": "THROTTLING",
                            "severity": "critical",
                            "timestamp": datetime.now().isoformat(),
                            "message": f"Resource {res['name']} is experiencing severe load saturation."
                        }
                     }
                     await websocket_manager.manager.broadcast(json.dumps(anomaly))

            # Simulate Task Auto Progression
            tasks_updated = False
            active_tasks = db.query(models.Task).filter(models.Task.status != 'COMPLETED').all()
            for task in active_tasks:
                if random.random() > 0.85: # 15% chance to progress each tick
                    # Automatic allocation fallback
                    if task.status == 'PENDING' and not task.assigned_resource_id:
                        available = [r for r in resources if r.current_load < 80 and r.status == "NORMAL"]
                        if available:
                            task.assigned_resource_id = random.choice(available).id
                            task.status = 'ASSIGNED'
                            tasks_updated = True
                    # Progress states
                    elif task.status == 'ASSIGNED':
                        task.status = 'IN_PROGRESS'
                        tasks_updated = True
                    elif task.status == 'IN_PROGRESS':
                        task.status = 'COMPLETED'
                        tasks_updated = True

            if tasks_updated:
                db.commit()
                # Broadcast updated tasks
                all_tasks = db.query(models.Task).all()
                task_data = [{
                    "id": t.id,
                    "title": t.title,
                    "priority": t.priority,
                    "estimated_time": t.estimated_time,
                    "assigned_resource_id": t.assigned_resource_id,
                    "user_id": t.user_id,
                    "status": t.status,
                    "created_at": t.created_at.isoformat() if t.created_at else None
                } for t in all_tasks]
                await websocket_manager.manager.broadcast(json.dumps({
                    "type": "TASK_UPDATE", 
                    "data": task_data
                }))

        finally:
            db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    models.Base.metadata.create_all(bind=database.engine)
    
    # Seed Data
    db = database.SessionLocal()
    if db.query(models.Resource).count() == 0:
        seed_resources = [
            models.Resource(name='Cloud Compute Alpha', type='Compute', cost_per_hour=45, max_capacity=100, current_load=65, status='NORMAL'),
            models.Resource(name='GPU Cluster Node-01', type='GPU', cost_per_hour=120, max_capacity=100, current_load=88, status='HIGH_LOAD'),
            models.Resource(name='Storage Gateway Prime', type='Storage', cost_per_hour=15, max_capacity=100, current_load=32, status='NORMAL'),
            models.Resource(name='API Server West-2', type='Networking', cost_per_hour=30, max_capacity=100, current_load=95, status='CRITICAL'),
        ]
        db.add_all(seed_resources)
        db.commit()
    db.close()
    
    # Start simulation loop
    asyncio.create_task(simulate_system_load())
    
    yield
    # Shutdown logic

app = FastAPI(title="NexusAI Operational Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---

@app.post("/auth/signup", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/auth/token", response_model=schemas.Token)
async def login_for_access_token(form_data: auth.OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email, "is_admin": user.is_admin, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/users", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.get_users(db, skip=skip, limit=limit)

@app.get("/resources", response_model=List[schemas.Resource])
def read_resources(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    return crud.get_resources(db, skip=skip, limit=limit)

@app.post("/resources", response_model=schemas.Resource)
def create_resource(resource: schemas.ResourceBase, db: Session = Depends(database.get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    return crud.create_resource(db=db, resource=resource)

@app.get("/tasks", response_model=List[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    user_id = None if current_user.is_admin else current_user.id
    return crud.get_tasks(db, skip=skip, limit=limit, user_id=user_id)

@app.post("/tasks", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(database.get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    task.user_id = current_user.id
    return crud.create_task(db=db, task=task)

@app.post("/tasks/{task_id}/optimize", response_model=schemas.Resource)
def optimize_task(task_id: int, db: Session = Depends(database.get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    best_resource = ml_engine.AdaptiveOptimizer.run(task_id, db)
    return best_resource

@app.get("/predictions")
def get_predictions(db: Session = Depends(database.get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    # Get historical load (mocked for now as we don't have Metric history yet)
    # In real world, query Metric table
    historical_loads = [40 + (i % 10) for i in range(24)] 
    predictions = ml_engine.WorkloadPredictor.predict(historical_loads)
    
    # Format for frontend
    result = []
    now = datetime.now()
    for i, pred in enumerate(predictions):
         time_str = (now + timedelta(hours=i+1)).strftime("%H:%M") 
         result.append({"time": time_str, "predicted": round(pred, 1)})
    return result

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        websocket_manager.manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
