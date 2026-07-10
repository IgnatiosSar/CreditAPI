import torch
import os
from sklearn.model_selection import train_test_split
from data.data_loader import get_processed_data
from model.model import CreditRiskModel
from torch.utils.data import TensorDataset, DataLoader
from trainer.trainer import CreditRiskTrainer
from config import CONFIG


torch.manual_seed(CONFIG["seed"])

def main():
    '''
    Main function to train the credit risk model.
    '''
    df = get_processed_data()

    X = df.drop(columns=[CONFIG["target_column"]]).values
    y = df[CONFIG["target_column"]].values

    X_train, _, y_train, _ = train_test_split(
        X, y, test_size=CONFIG["test_size"], random_state=CONFIG["seed"]
    )

  
    X_train_t = torch.tensor(X_train, dtype=torch.float32)
    y_train_t = torch.tensor(y_train, dtype=torch.float32).unsqueeze(1)

    train_dataset = TensorDataset(X_train_t, y_train_t)
    train_loader = DataLoader(train_dataset, batch_size=CONFIG["batch_size"], shuffle=True)

    model = CreditRiskModel(input_size=X_train_t.shape[1])

    loss_fn = torch.nn.BCELoss() 
    optimizer = torch.optim.Adam(model.parameters(), lr=CONFIG["learning_rate"])
    
    trainer = CreditRiskTrainer(model, optimizer, loss_fn)
    trainer.train(train_loader, num_epochs=CONFIG["epochs"])

    save_dir = "saved_model"
    file_path = os.path.join(save_dir, "credit_risk_model.pt")
    
    torch.save(model.state_dict(), file_path)


if __name__ == "__main__":
    main()