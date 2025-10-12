"""
Data loading utilities for model training
"""

import pandas as pd
import numpy as np
from typing import Tuple, Optional, Union, List
import os
import json
import yaml
from pathlib import Path


class DataLoader:
    """Utility class for loading and preprocessing datasets"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
    
    def load_csv(self, file_path: str, **kwargs) -> pd.DataFrame:
        """Load CSV file into DataFrame"""
        full_path = self.data_dir / file_path
        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {full_path}")
        
        return pd.read_csv(full_path, **kwargs)
    
    def load_json(self, file_path: str, **kwargs) -> Union[dict, list]:
        """Load JSON file"""
        full_path = self.data_dir / file_path
        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {full_path}")
        
        with open(full_path, 'r') as f:
            return json.load(f)
    
    def load_yaml(self, file_path: str) -> dict:
        """Load YAML configuration file"""
        full_path = self.data_dir / file_path
        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {full_path}")
        
        with open(full_path, 'r') as f:
            return yaml.safe_load(f)
    
    def load_dataset(self, config: dict) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
        """Load dataset based on configuration"""
        file_path = config['path']
        file_format = config.get('format', 'csv')
        
        if file_format == 'csv':
            df = self.load_csv(file_path)
        elif file_format == 'json':
            data = self.load_json(file_path)
            df = pd.DataFrame(data)
        else:
            raise ValueError(f"Unsupported file format: {file_format}")
        
        # Extract target column if specified
        target_column = config.get('target_column')
        if target_column and target_column in df.columns:
            X = df.drop(columns=[target_column])
            y = df[target_column]
            return X, y
        else:
            return df, None
    
    def split_data(self, X: pd.DataFrame, y: Optional[pd.Series] = None, 
                   test_size: float = 0.2, random_state: int = 42) -> Tuple:
        """Split data into train and test sets"""
        from sklearn.model_selection import train_test_split
        
        if y is not None:
            return train_test_split(X, y, test_size=test_size, random_state=random_state)
        else:
            return train_test_split(X, test_size=test_size, random_state=random_state)
    
    def get_feature_columns(self, df: pd.DataFrame, config: dict) -> List[str]:
        """Get feature columns based on configuration"""
        if 'features' in config:
            return config['features']
        else:
            # Return all columns except target
            target_column = config.get('target_column')
            if target_column:
                return [col for col in df.columns if col != target_column]
            else:
                return list(df.columns)
    
    def validate_data(self, df: pd.DataFrame, config: dict) -> dict:
        """Validate dataset and return validation report"""
        report = {
            'shape': df.shape,
            'missing_values': df.isnull().sum().to_dict(),
            'data_types': df.dtypes.to_dict(),
            'memory_usage': df.memory_usage(deep=True).sum(),
            'duplicates': df.duplicated().sum()
        }
        
        # Check for required columns
        required_columns = config.get('required_columns', [])
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            report['missing_required_columns'] = missing_columns
        
        # Check data quality
        report['data_quality'] = {
            'completeness': (1 - df.isnull().sum().sum() / (df.shape[0] * df.shape[1])),
            'uniqueness': (1 - df.duplicated().sum() / df.shape[0])
        }
        
        return report


def load_dataset(config_path: str) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
    """Load dataset from configuration file"""
    loader = DataLoader()
    config = loader.load_yaml(config_path)
    return loader.load_dataset(config)


def split_data(X: pd.DataFrame, y: Optional[pd.Series] = None, 
               test_size: float = 0.2, random_state: int = 42) -> Tuple:
    """Split data into train and test sets"""
    loader = DataLoader()
    return loader.split_data(X, y, test_size, random_state)


def validate_dataset(df: pd.DataFrame, config: dict) -> dict:
    """Validate dataset and return validation report"""
    loader = DataLoader()
    return loader.validate_data(df, config)


# Example usage
if __name__ == "__main__":
    # Example configuration
    config = {
        'path': 'cybersecurity_logs.csv',
        'format': 'csv',
        'target_column': 'threat_level',
        'features': ['packet_size', 'duration', 'port', 'protocol'],
        'required_columns': ['packet_size', 'duration', 'port', 'protocol', 'threat_level']
    }
    
    # Load dataset
    loader = DataLoader()
    X, y = loader.load_dataset(config)
    
    # Split data
    X_train, X_test, y_train, y_test = loader.split_data(X, y)
    
    # Validate data
    validation_report = loader.validate_data(X, config)
    print("Validation Report:", validation_report)
