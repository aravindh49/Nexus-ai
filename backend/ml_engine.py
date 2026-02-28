
import numpy as np
from sklearn.linear_model import LinearRegression
from sqlalchemy.orm import Session
from . import models

class WorkloadPredictor:
    @staticmethod
    def predict(historical_loads: list):
        if len(historical_loads) < 5:
            return [0] * 12
        
        # Simple Linear Regression for short-term trend
        X = np.array(range(len(historical_loads))).reshape(-1, 1)
        y = np.array(historical_loads)
        model = LinearRegression().fit(X, y)
        
        future_indices = np.array(range(len(historical_loads), len(historical_loads) + 12)).reshape(-1, 1)
        predictions = model.predict(future_indices)
        return predictions.tolist()

class AdaptiveOptimizer:
    @staticmethod
    def run(task_id: int, db: Session):
        task = db.query(models.Task).filter(models.Task.id == task_id).first()
        resources = db.query(models.Resource).all()
        
        # RL-inspired scoring formula
        # Score = (Priority * 20) - (Cost * 0.1) - (CurrentLoad * 0.5)
        scored_resources = []
        for res in resources:
            score = (task.priority * 20) - (res.cost_per_hour * 0.1) - (res.current_load * 0.5)
            scored_resources.append((score, res))
            
        # Select best resource
        best_res = sorted(scored_resources, key=lambda x: x[0], reverse=True)[0][1]
        
        # Update task assignment
        task.assigned_resource_id = best_res.id
        task.status = "ASSIGNED"
        db.commit()
        
        return best_res

class AnomalyDetector:
    @staticmethod
    def is_anomalous(current_load: float, historical_avg: float, std_dev: float):
        # Simple Z-score anomaly detection
        z_score = abs(current_load - historical_avg) / (std_dev + 1e-6)
        return z_score > 3.0
