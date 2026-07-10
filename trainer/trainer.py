
class CreditRiskTrainer:
    '''
    Class for training the CreditRiskModel.
    '''

    def __init__(self, model, optimizer, loss_fn):
        self.model = model
        self.optimizer = optimizer
        self.loss_fn = loss_fn

    def train(self, train_loader, num_epochs):
        '''
        Method to train the model.
        '''
        self.model.train()
        for epoch in range(num_epochs):
            for batch in train_loader:
                inputs, targets = batch
                # Zero the gradients
                self.optimizer.zero_grad()
                # Forward pass
                outputs = self.model(inputs)
                # Compute the loss
                loss = self.loss_fn(outputs, targets)
                # Backward pass and optimization
                loss.backward()
                self.optimizer.step()
            if (epoch + 1) % 10 == 0:
                print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')