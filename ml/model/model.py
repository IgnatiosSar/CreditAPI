from torch import nn

class CreditRiskModel(nn.Module):
    '''
    Class defining a simple feedforward neural network for credit risk prediction.
    '''

    def __init__(self, input_size, hidden_layers):
        super(). __init__()
        # Define the layers of the model
        self.layer1 = nn.Linear(input_size, hidden_layers[0])
        self.relu1 = nn.ReLU()
        self.layer2 = nn.Linear(hidden_layers[0], hidden_layers[1])
        self.relu2 = nn.ReLU()
        self.output_layer = nn.Linear(hidden_layers[1], 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        # Define the forward pass
        x = self.layer1(x)
        x = self.relu1(x)
        x = self.layer2(x)
        x = self.relu2(x)
        x = self.output_layer(x)
        x = self.sigmoid(x)
        return x