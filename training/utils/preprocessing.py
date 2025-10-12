"""
Data preprocessing utilities for model training
"""

import pandas as pd
import numpy as np
from typing import Tuple, Optional, List, Dict, Any
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, LabelEncoder, OneHotEncoder
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.feature_selection import SelectKBest, f_classif, mutual_info_classif
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline
import joblib
from pathlib import Path


class DataPreprocessor:
    """Utility class for data preprocessing"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.scalers = {}
        self.encoders = {}
        self.imputers = {}
        self.feature_selectors = {}
        self.pca_transformers = {}
        
    def handle_missing_values(self, X: pd.DataFrame, strategy: str = 'mean') -> pd.DataFrame:
        """Handle missing values in the dataset"""
        if strategy == 'drop':
            return X.dropna()
        elif strategy == 'mean':
            imputer = SimpleImputer(strategy='mean')
        elif strategy == 'median':
            imputer = SimpleImputer(strategy='median')
        elif strategy == 'mode':
            imputer = SimpleImputer(strategy='most_frequent')
        elif strategy == 'knn':
            imputer = KNNImputer(n_neighbors=5)
        else:
            raise ValueError(f"Unknown imputation strategy: {strategy}")
        
        # Fit and transform
        X_imputed = imputer.fit_transform(X)
        return pd.DataFrame(X_imputed, columns=X.columns, index=X.index)
    
    def encode_categorical(self, X: pd.DataFrame, method: str = 'onehot') -> pd.DataFrame:
        """Encode categorical variables"""
        categorical_columns = X.select_dtypes(include=['object', 'category']).columns
        
        if method == 'onehot':
            encoder = OneHotEncoder(drop='first', sparse_output=False)
            encoded_data = encoder.fit_transform(X[categorical_columns])
            encoded_df = pd.DataFrame(
                encoded_data,
                columns=encoder.get_feature_names_out(categorical_columns),
                index=X.index
            )
            # Combine with numerical columns
            numerical_columns = X.select_dtypes(exclude=['object', 'category']).columns
            result = pd.concat([X[numerical_columns], encoded_df], axis=1)
            
        elif method == 'label':
            result = X.copy()
            for col in categorical_columns:
                encoder = LabelEncoder()
                result[col] = encoder.fit_transform(X[col].astype(str))
                
        else:
            raise ValueError(f"Unknown encoding method: {method}")
        
        return result
    
    def scale_features(self, X: pd.DataFrame, method: str = 'standard') -> pd.DataFrame:
        """Scale numerical features"""
        numerical_columns = X.select_dtypes(include=[np.number]).columns
        
        if method == 'standard':
            scaler = StandardScaler()
        elif method == 'minmax':
            scaler = MinMaxScaler()
        elif method == 'robust':
            scaler = RobustScaler()
        else:
            raise ValueError(f"Unknown scaling method: {method}")
        
        # Fit and transform
        X_scaled = scaler.fit_transform(X[numerical_columns])
        result = X.copy()
        result[numerical_columns] = X_scaled
        
        # Store scaler for later use
        self.scalers[method] = scaler
        
        return result
    
    def select_features(self, X: pd.DataFrame, y: pd.Series, method: str = 'mutual_info', 
                       k: int = 10) -> pd.DataFrame:
        """Select top k features"""
        if method == 'mutual_info':
            selector = SelectKBest(score_func=mutual_info_classif, k=k)
        elif method == 'f_classif':
            selector = SelectKBest(score_func=f_classif, k=k)
        else:
            raise ValueError(f"Unknown feature selection method: {method}")
        
        # Fit and transform
        X_selected = selector.fit_transform(X, y)
        selected_features = X.columns[selector.get_support()]
        
        # Store selector for later use
        self.feature_selectors[method] = selector
        
        return pd.DataFrame(X_selected, columns=selected_features, index=X.index)
    
    def apply_pca(self, X: pd.DataFrame, n_components: Optional[int] = None, 
                  variance_threshold: float = 0.95) -> pd.DataFrame:
        """Apply Principal Component Analysis"""
        if n_components is None:
            # Determine number of components to explain variance_threshold of variance
            pca_temp = PCA()
            pca_temp.fit(X)
            cumsum = np.cumsum(pca_temp.explained_variance_ratio_)
            n_components = np.argmax(cumsum >= variance_threshold) + 1
        
        pca = PCA(n_components=n_components)
        X_pca = pca.fit_transform(X)
        
        # Store PCA transformer for later use
        self.pca_transformers['pca'] = pca
        
        # Create column names
        columns = [f'PC{i+1}' for i in range(n_components)]
        return pd.DataFrame(X_pca, columns=columns, index=X.index)
    
    def remove_outliers(self, X: pd.DataFrame, method: str = 'iqr', 
                       threshold: float = 1.5) -> pd.DataFrame:
        """Remove outliers from the dataset"""
        if method == 'iqr':
            Q1 = X.quantile(0.25)
            Q3 = X.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - threshold * IQR
            upper_bound = Q3 + threshold * IQR
            
            # Remove outliers
            mask = ((X >= lower_bound) & (X <= upper_bound)).all(axis=1)
            return X[mask]
            
        elif method == 'zscore':
            from scipy import stats
            z_scores = np.abs(stats.zscore(X))
            mask = (z_scores < threshold).all(axis=1)
            return X[mask]
            
        else:
            raise ValueError(f"Unknown outlier removal method: {method}")
    
    def create_pipeline(self, steps: List[Dict[str, Any]]) -> Pipeline:
        """Create a preprocessing pipeline"""
        pipeline_steps = []
        
        for step in steps:
            step_name = step['name']
            step_type = step['type']
            step_params = step.get('params', {})
            
            if step_type == 'imputer':
                if step_params.get('strategy') == 'knn':
                    pipeline_steps.append((step_name, KNNImputer(**step_params)))
                else:
                    pipeline_steps.append((step_name, SimpleImputer(**step_params)))
                    
            elif step_type == 'encoder':
                if step_params.get('method') == 'onehot':
                    pipeline_steps.append((step_name, OneHotEncoder(**step_params)))
                else:
                    pipeline_steps.append((step_name, LabelEncoder()))
                    
            elif step_type == 'scaler':
                if step_params.get('method') == 'standard':
                    pipeline_steps.append((step_name, StandardScaler()))
                elif step_params.get('method') == 'minmax':
                    pipeline_steps.append((step_name, MinMaxScaler()))
                elif step_params.get('method') == 'robust':
                    pipeline_steps.append((step_name, RobustScaler()))
                    
            elif step_type == 'feature_selector':
                if step_params.get('method') == 'mutual_info':
                    pipeline_steps.append((step_name, SelectKBest(score_func=mutual_info_classif, **step_params)))
                elif step_params.get('method') == 'f_classif':
                    pipeline_steps.append((step_name, SelectKBest(score_func=f_classif, **step_params)))
                    
            elif step_type == 'pca':
                pipeline_steps.append((step_name, PCA(**step_params)))
        
        return Pipeline(pipeline_steps)
    
    def preprocess_data(self, X: pd.DataFrame, y: Optional[pd.Series] = None, 
                       config: Optional[Dict[str, Any]] = None) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
        """Preprocess data based on configuration"""
        if config is None:
            config = self.config
        
        # Handle missing values
        if 'missing_values' in config:
            X = self.handle_missing_values(X, config['missing_values']['strategy'])
        
        # Encode categorical variables
        if 'encoding' in config and config['encoding']['enabled']:
            X = self.encode_categorical(X, config['encoding']['method'])
        
        # Scale features
        if 'scaling' in config and config['scaling']['enabled']:
            X = self.scale_features(X, config['scaling']['method'])
        
        # Remove outliers
        if 'outlier_removal' in config and config['outlier_removal']['enabled']:
            X = self.remove_outliers(X, config['outlier_removal']['method'])
        
        # Feature selection
        if 'feature_selection' in config and config['feature_selection']['enabled'] and y is not None:
            X = self.select_features(X, y, config['feature_selection']['method'], 
                                   config['feature_selection']['k'])
        
        # Apply PCA
        if 'pca' in config and config['pca']['enabled']:
            X = self.apply_pca(X, config['pca']['n_components'], 
                             config['pca']['variance_threshold'])
        
        return X, y
    
    def save_preprocessors(self, save_dir: str):
        """Save fitted preprocessors"""
        save_path = Path(save_dir)
        save_path.mkdir(exist_ok=True)
        
        # Save scalers
        for name, scaler in self.scalers.items():
            joblib.dump(scaler, save_path / f'scaler_{name}.pkl')
        
        # Save encoders
        for name, encoder in self.encoders.items():
            joblib.dump(encoder, save_path / f'encoder_{name}.pkl')
        
        # Save imputers
        for name, imputer in self.imputers.items():
            joblib.dump(imputer, save_path / f'imputer_{name}.pkl')
        
        # Save feature selectors
        for name, selector in self.feature_selectors.items():
            joblib.dump(selector, save_path / f'selector_{name}.pkl')
        
        # Save PCA transformers
        for name, pca in self.pca_transformers.items():
            joblib.dump(pca, save_path / f'pca_{name}.pkl')
    
    def load_preprocessors(self, load_dir: str):
        """Load fitted preprocessors"""
        load_path = Path(load_dir)
        
        # Load scalers
        for scaler_file in load_path.glob('scaler_*.pkl'):
            name = scaler_file.stem.replace('scaler_', '')
            self.scalers[name] = joblib.load(scaler_file)
        
        # Load encoders
        for encoder_file in load_path.glob('encoder_*.pkl'):
            name = encoder_file.stem.replace('encoder_', '')
            self.encoders[name] = joblib.load(encoder_file)
        
        # Load imputers
        for imputer_file in load_path.glob('imputer_*.pkl'):
            name = imputer_file.stem.replace('imputer_', '')
            self.imputers[name] = joblib.load(imputer_file)
        
        # Load feature selectors
        for selector_file in load_path.glob('selector_*.pkl'):
            name = selector_file.stem.replace('selector_', '')
            self.feature_selectors[name] = joblib.load(selector_file)
        
        # Load PCA transformers
        for pca_file in load_path.glob('pca_*.pkl'):
            name = pca_file.stem.replace('pca_', '')
            self.pca_transformers[name] = joblib.load(pca_file)


def preprocess_data(X: pd.DataFrame, y: Optional[pd.Series] = None, 
                   config: Optional[Dict[str, Any]] = None) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
    """Preprocess data using the DataPreprocessor class"""
    preprocessor = DataPreprocessor(config)
    return preprocessor.preprocess_data(X, y, config)


# Example usage
if __name__ == "__main__":
    # Example configuration
    config = {
        'missing_values': {
            'strategy': 'mean'
        },
        'encoding': {
            'enabled': True,
            'method': 'onehot'
        },
        'scaling': {
            'enabled': True,
            'method': 'standard'
        },
        'outlier_removal': {
            'enabled': True,
            'method': 'iqr',
            'threshold': 1.5
        },
        'feature_selection': {
            'enabled': True,
            'method': 'mutual_info',
            'k': 10
        },
        'pca': {
            'enabled': False
        }
    }
    
    # Create sample data
    np.random.seed(42)
    X = pd.DataFrame({
        'feature1': np.random.normal(0, 1, 100),
        'feature2': np.random.normal(0, 1, 100),
        'feature3': np.random.choice(['A', 'B', 'C'], 100),
        'feature4': np.random.normal(0, 1, 100)
    })
    y = pd.Series(np.random.choice([0, 1], 100))
    
    # Preprocess data
    X_processed, y_processed = preprocess_data(X, y, config)
    print("Original shape:", X.shape)
    print("Processed shape:", X_processed.shape)
    print("Processed columns:", X_processed.columns.tolist())
