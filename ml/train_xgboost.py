


from sklearn.model_selection import train_test_split
import xgboost as xgb

from config import CONFIG
from ml.data.data_loader import get_processed_data
from pathlib import Path




def main():
    '''
    Main function to train the credit risk model using XGBoost.
    '''
    df = get_processed_data()
    X = df.drop(columns=[CONFIG["target_column"]]).values
    y = df[CONFIG["target_column"]].values
 
    # Same test_size / random_state as train.py + test.py — required so
    # X_test here is the exact same held-out rows the NN was scored on.
    X_train, _, y_train, _ = train_test_split(
        X, y, test_size=CONFIG["test_size"], random_state=CONFIG["seed"]
    )
    # Because false negatives (falsely predicting a risky customer as safe) are very costly, we set scale_pos_weight to penalize misclassifying the minority 
    pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
    
    model = xgb.XGBClassifier(
        n_estimators=CONFIG["xgb_n_estimators"],
        max_depth=CONFIG["xgb_max_depth"],
        learning_rate=CONFIG["xgb_learning_rate"],
        random_state=CONFIG["seed"],
        scale_pos_weight=pos_weight
    )

    model.fit(X_train, y_train)

    ml_dir = Path(__file__).resolve().parent
    save_dir = ml_dir / "saved_model"
    save_dir.mkdir(parents=True, exist_ok=True)     
    model_path = save_dir / "xgboost_model.json"    
    model.save_model(model_path)


    

if __name__ == "__main__":
    main()
