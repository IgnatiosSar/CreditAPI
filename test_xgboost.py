
import os
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import xgboost as xgb

from sklearn.model_selection import train_test_split

from config import CONFIG
from data.data_loader import get_processed_data


def main():
    '''
    Main function to test the trained credit risk model using XGBoost.
    '''
    df = get_processed_data()
    X = df.drop(columns=[CONFIG["target_column"]]).values
    y = df[CONFIG["target_column"]].values

    _, X_test, _, Y_test = train_test_split(
        X, y, test_size=CONFIG["test_size"], random_state=CONFIG["seed"]
    )

    model_path = os.path.join("saved_model", "xgboost_model.json")
    
    try:
        model = xgb.XGBClassifier()
        model.load_model(model_path)
    except FileNotFoundError:
        print(f"File not found: {model_path}. Please ensure the model has been trained and saved.")
        return

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]  # Probability of the bad class (1) for ROC-AUC calculation
    
    print("XGBoost Evaluation Results")

    print(model.classes_)
    
    print(classification_report(Y_test, y_pred, target_names=["good", "bad"]))
    print("Confusion matrix:\n", confusion_matrix(Y_test, y_pred))
    print(f"ROC-AUC: {roc_auc_score(Y_test, y_prob):.4f}\n")

if __name__ == "__main__":
    main()