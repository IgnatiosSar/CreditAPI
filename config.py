# config.py

CONFIG = {
    "seed": 42,
    
    #Dataset
    "target_column": "Risk",
    "test_size": 0.2,
    "random_state": 42,
    
    # Neural Network
    "hidden_layers": [32, 16],
    
    # Training
    "batch_size": 32,
    "learning_rate": 0.001,
    "epochs": 100,

    # XGBoost
    "xgb_n_estimators": 100,
    "xgb_max_depth": 4,
    "xgb_learning_rate": 0.1,

    # Business Logic
    "approval_threshold": 0.5
}