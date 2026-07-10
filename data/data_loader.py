import pandas as pd
import kagglehub
from kagglehub import KaggleDatasetAdapter
from sklearn.preprocessing import StandardScaler

def load_data():
    '''
    Load the German Credit dataset from Kaggle.
    '''
    
    file_path = "german_credit_data.csv"

    # Load the latest version
    df = kagglehub.load_dataset(
    KaggleDatasetAdapter.PANDAS,
    "kabure/german-credit-data-with-risk",
    file_path
    )
    return df

def preprocess_data(df):
    '''
    Process the German Credit dataset.
    '''
    # Drop the 'Unnamed: 0' column
    df = df.drop(columns=['Unnamed: 0'])
    
    categorical_columns = ['Sex', 'Housing', 'Purpose']

    # One-hot encode categorical columns
    df = pd.get_dummies(df, columns=categorical_columns, drop_first=True, dtype=int)

    # Map the savings and checking account columns to numerical values (ordinal)
    savings_mapper = { 'little': 1, 'moderate': 2, 'quite rich': 3, 'rich': 4 }
    df['Saving accounts'] = df['Saving accounts'].map(savings_mapper).fillna(0)

    checking_mapper = { 'little': 1, 'moderate': 2, 'rich': 3 }
    df['Checking account'] = df['Checking account'].map(checking_mapper).fillna(0)

    # Map the 'Risk' column to numerical values (binary)    
    risk_mapper = { 'good': 0, 'bad': 1 }
    df['Risk'] = df['Risk'].map(risk_mapper)

    numerical_columns = ['Age', 'Credit amount', 'Duration']

    # Standardize numerical columns
    scaler = StandardScaler()
    df[numerical_columns] = scaler.fit_transform(df[numerical_columns])

    return df

def get_processed_data():
    '''
    Load and preprocess the German Credit dataset.
    '''
    df = load_data()
    df = preprocess_data(df)
    return df

