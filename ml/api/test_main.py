from fastapi.testclient import TestClient
from ml.api.main import app

client = TestClient(app)

def test_predict_approve():
    '''
    Test the /predict endpoint with a sample input that should be approved.
    '''
    data = {
        "age": 45,
        "sex": "male",
        "job": 2,
        "housing": "own",
        "saving_accounts": "rich",
        "checking_account": "rich",
        "credit_amount": 1500.0,
        "duration": 12,
        "purpose": "furniture/equipment"
    }

    response = client.post("/predict", json=data)
    assert response.status_code == 200
    result = response.json()
    assert result["is_approved"] is True
    assert result["probability_good"] > 0.5


def test_predict_reject():
    '''
    Test the /predict endpoint with a sample input that should be rejected.
    '''
    data = {
        "age": 19,
        "sex": "male",
        "job": 0,
        "housing": "free",
        "saving_accounts": "little",
        "checking_account": "little",
        "credit_amount": 18500.0,
        "duration": 72,
        "purpose": "vacation/others"
    }

    response = client.post("/predict", json=data)
    assert response.status_code == 200
    result = response.json()        
    assert result["is_approved"] is False
    assert result["probability_good"] < 0.5