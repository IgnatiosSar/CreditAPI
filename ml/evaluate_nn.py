

import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import torch
from pathlib import Path
from ml.data.data_loader import get_processed_data
from config import CONFIG
from ml.model.model import CreditRiskModel

torch.manual_seed(CONFIG["seed"])

def main():
    '''
    Main function to test the trained credit risk model.
    '''

    df = get_processed_data()
    X = df.drop(columns=[CONFIG["target_column"]]).values
    Y = df[CONFIG["target_column"]].values

    _, X_test, _, Y_test = train_test_split(
        X, Y, test_size=CONFIG["test_size"], random_state=CONFIG["seed"]
    )

    ml_dir = Path(__file__).resolve().parent
    scaler_path = ml_dir / "saved_model" / "scaler.joblib"
    try:
        scaler = joblib.load(scaler_path)
    except FileNotFoundError:
        print("Scaler file not found. Please ensure the model has been trained and the scaler has been saved.")
        return
    
    X_test = scaler.transform(X_test)

    X_test_t = torch.tensor(X_test, dtype=torch.float32)
    Y_test_t = torch.tensor(Y_test, dtype=torch.float32).unsqueeze(1)

    model_path = ml_dir / "saved_model" / "credit_risk_model.pt"

    try:
        hidden_layers = CONFIG["hidden_layers"]
        model = CreditRiskModel(input_size=X_test_t.shape[1], hidden_layers=hidden_layers)
        model.load_state_dict(torch.load(model_path, weights_only=True))
    except FileNotFoundError:
        print(f"File not found: {model_path}. Please ensure the model has been trained and saved.")
        return

    model.eval()
    with torch.no_grad():
        
        predictions = model(X_test_t)
        
        predicted_classes = (predictions >= 0.5).float()
        
        correct = (predicted_classes == Y_test_t).sum().item()
        total = Y_test_t.shape[0]
        accuracy = correct / total
        
   
      
        print(f"Total : {total}")
        print(f"Correct Predictions: {correct}")
        print(f"Accuracy: {accuracy * 100:.2f}%")
        y_true = Y_test_t.numpy().ravel()
        y_pred = predicted_classes.numpy().ravel()
        y_prob = predictions.numpy().ravel()

        print(classification_report(y_true, y_pred, target_names=["good", "bad"]))
        print("Confusion matrix:\n", confusion_matrix(y_true, y_pred))
        print(f"ROC-AUC: {roc_auc_score(y_true, y_prob):.4f}")

if __name__ == "__main__":
    main()