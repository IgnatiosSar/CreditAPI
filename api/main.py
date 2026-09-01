import json
from typing import Literal

import pandas as pd
import xgboost as xgb
from fastapi import FastAPI
from pydantic import BaseModel, Field
from config import CONFIG

app = FastAPI()

# Load the trained XGBoost model
model_path = "saved_model/xgboost_model.json"
model = xgb.XGBClassifier()
model.load_model(model_path)

approval_threshold = CONFIG["approval_threshold"]

savings_mapper = { 'little': 1, 'moderate': 2, 'quite rich': 3, 'rich': 4 }
checking_mapper = { 'little': 1, 'moderate': 2, 'rich': 3 }
categorical_columns = ['Sex', 'Housing', 'Purpose']

with open("saved_model/feature_columns.json") as f:
    feature_columns = json.load(f)  # Same columns used to train both NN and XGBoost


class CreditProfile(BaseModel):
    '''
    Class to represent a credit profile for prediction. The features are based on the German Credit Data dataset.
    '''
    age: int = Field(..., ge=18, le=100)
    sex: Literal["male", "female"]
    job: int = Field(..., ge=0, le=3)
    housing: Literal["own", "rent", "free"]
    saving_accounts: Literal["little", "moderate", "quite rich", "rich"] | None = None
    checking_account: Literal["little", "moderate", "rich"] | None = None
    credit_amount: float = Field(..., gt=0)
    duration: int = Field(..., gt=0)
    purpose: Literal[
        "radio/TV",
        "education",
        "furniture/equipment",
        "car",
        "business",
        "domestic appliances",
        "repairs",
        "vacation/others",
    ]

class PredictionResponse(BaseModel):
    '''
    Class to represent the prediction response.
    '''
    is_approved: bool
    probability_good: float

def preprocess_input(data: CreditProfile):
    data_dict = {
        "Age": data.age,
        "Sex": data.sex,
        "Job": data.job,
        "Housing": data.housing,
        "Saving accounts": data.saving_accounts,
        "Checking account": data.checking_account,
        "Credit amount": data.credit_amount,
        "Duration": data.duration,
        "Purpose": data.purpose,
    }
    df = pd.DataFrame([data_dict])
    df['Saving accounts'] = df['Saving accounts'].map(savings_mapper).fillna(0)
    df['Checking account'] = df['Checking account'].map(checking_mapper).fillna(0)
    df = pd.get_dummies(df, columns=categorical_columns, drop_first=True, dtype=int)
    # Force the exact training-time columns, in the exact same order
    df = df.reindex(columns=feature_columns, fill_value=0)
    return df


@app.post("/predict", response_model=PredictionResponse)
def predict(data: CreditProfile):
    '''
    Endpoint to predict credit risk using the trained XGBoost model.
    '''
    df = preprocess_input(data)
    probability_good = model.predict_proba(df)[0][0]  # Probability of the "good" class
    is_approved = probability_good >= approval_threshold
    return PredictionResponse(is_approved=is_approved, probability_good=float(probability_good))
