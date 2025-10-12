"""
Random Forest Classifier Training Script
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve
import joblib
import json
import yaml
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any, Tuple
import argparse
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from utils.data_loader import DataLoader
from utils.preprocessing import DataPreprocessor
from utils.evaluation import ModelEvaluator


class RandomForestTrainer:
    """Random Forest Classifier Trainer"""
    
    def __init__(self, config_path: str):
        self.config_path = config_path
        self.config = self.load_config()
        self.data_loader = DataLoader()
        self.preprocessor = DataPreprocessor()
        self.evaluator = ModelEvaluator()
        
    def load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        with open(self.config_path, 'r') as f:
            return yaml.safe_load(f)
    
    def load_data(self) -> Tuple[pd.DataFrame, pd.Series]:
        """Load and prepare data"""
        # Load dataset configuration
        dataset_config = self.config['dataset']
        X, y = self.data_loader.load_dataset(dataset_config)
        
        # Get feature columns
        feature_columns = self.data_loader.get_feature_columns(X, dataset_config)
        X = X[feature_columns]
        
        return X, y
    
    def preprocess_data(self, X: pd.DataFrame, y: pd.Series) -> Tuple[pd.DataFrame, pd.Series]:
        """Preprocess the data"""
        preprocessing_config = self.config.get('preprocessing', {})
        X_processed, y_processed = self.preprocessor.preprocess_data(X, y, preprocessing_config)
        return X_processed, y_processed
    
    def train_model(self, X_train: pd.DataFrame, y_train: pd.Series) -> RandomForestClassifier:
        """Train Random Forest model"""
        model_config = self.config['model']
        hyperparameters = model_config.get('hyperparameters', {})
        
        # Create model
        model = RandomForestClassifier(**hyperparameters)
        
        # Train model
        model.fit(X_train, y_train)
        
        return model
    
    def optimize_hyperparameters(self, X_train: pd.DataFrame, y_train: pd.Series) -> Dict[str, Any]:
        """Optimize hyperparameters using GridSearchCV"""
        optimization_config = self.config.get('optimization', {})
        
        if not optimization_config.get('enabled', False):
            return self.config['model']['hyperparameters']
        
        # Define parameter grid
        param_grid = optimization_config.get('param_grid', {
            'n_estimators': [50, 100, 200],
            'max_depth': [5, 10, 15, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        })
        
        # Create base model
        base_model = RandomForestClassifier(random_state=42)
        
        # Grid search
        grid_search = GridSearchCV(
            base_model,
            param_grid,
            cv=optimization_config.get('cv', 5),
            scoring=optimization_config.get('scoring', 'accuracy'),
            n_jobs=optimization_config.get('n_jobs', -1),
            verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        return grid_search.best_params_
    
    def evaluate_model(self, model: RandomForestClassifier, X_test: pd.DataFrame, 
                      y_test: pd.Series) -> Dict[str, Any]:
        """Evaluate the trained model"""
        # Make predictions
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        # Calculate metrics
        metrics = {
            'accuracy': model.score(X_test, y_test),
            'classification_report': classification_report(y_test, y_pred, output_dict=True),
            'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
            'roc_auc': roc_auc_score(y_test, y_pred_proba),
            'feature_importance': dict(zip(X_test.columns, model.feature_importances_))
        }
        
        return metrics
    
    def cross_validate(self, model: RandomForestClassifier, X: pd.DataFrame, 
                      y: pd.Series) -> Dict[str, Any]:
        """Perform cross-validation"""
        cv_config = self.config.get('cross_validation', {})
        
        if not cv_config.get('enabled', False):
            return {}
        
        # Perform cross-validation
        cv_scores = cross_val_score(
            model, X, y,
            cv=cv_config.get('folds', 5),
            scoring=cv_config.get('scoring', 'accuracy')
        )
        
        return {
            'cv_scores': cv_scores.tolist(),
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std()
        }
    
    def save_model(self, model: RandomForestClassifier, metrics: Dict[str, Any], 
                   save_dir: str):
        """Save trained model and results"""
        save_path = Path(save_dir)
        save_path.mkdir(parents=True, exist_ok=True)
        
        # Save model
        joblib.dump(model, save_path / 'model.pkl')
        
        # Save metrics
        with open(save_path / 'metrics.json', 'w') as f:
            json.dump(metrics, f, indent=2)
        
        # Save configuration
        with open(save_path / 'config.yaml', 'w') as f:
            yaml.dump(self.config, f, default_flow_style=False)
        
        # Save preprocessors
        self.preprocessor.save_preprocessors(str(save_path / 'preprocessors'))
        
        print(f"Model saved to {save_path}")
    
    def plot_results(self, model: RandomForestClassifier, X_test: pd.DataFrame, 
                    y_test: pd.Series, save_dir: str):
        """Plot training results"""
        save_path = Path(save_dir)
        save_path.mkdir(parents=True, exist_ok=True)
        
        # Make predictions
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        # Plot confusion matrix
        plt.figure(figsize=(8, 6))
        cm = confusion_matrix(y_test, y_pred)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.savefig(save_path / 'confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # Plot ROC curve
        plt.figure(figsize=(8, 6))
        fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
        plt.plot(fpr, tpr, label=f'ROC Curve (AUC = {roc_auc_score(y_test, y_pred_proba):.3f})')
        plt.plot([0, 1], [0, 1], 'k--', label='Random')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('ROC Curve')
        plt.legend()
        plt.savefig(save_path / 'roc_curve.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # Plot feature importance
        plt.figure(figsize=(10, 6))
        feature_importance = pd.DataFrame({
            'feature': X_test.columns,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        sns.barplot(data=feature_importance.head(20), x='importance', y='feature')
        plt.title('Feature Importance (Top 20)')
        plt.xlabel('Importance')
        plt.tight_layout()
        plt.savefig(save_path / 'feature_importance.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"Plots saved to {save_path}")
    
    def train(self):
        """Main training pipeline"""
        print("Starting Random Forest training...")
        
        # Load data
        print("Loading data...")
        X, y = self.load_data()
        print(f"Data shape: {X.shape}")
        
        # Preprocess data
        print("Preprocessing data...")
        X_processed, y_processed = self.preprocess_data(X, y)
        print(f"Processed data shape: {X_processed.shape}")
        
        # Split data
        print("Splitting data...")
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y_processed,
            test_size=self.config.get('train_test_split', 0.2),
            random_state=42,
            stratify=y_processed
        )
        
        # Optimize hyperparameters
        if self.config.get('optimization', {}).get('enabled', False):
            print("Optimizing hyperparameters...")
            best_params = self.optimize_hyperparameters(X_train, y_train)
            print(f"Best parameters: {best_params}")
            # Update config with best parameters
            self.config['model']['hyperparameters'].update(best_params)
        
        # Train model
        print("Training model...")
        model = self.train_model(X_train, y_train)
        
        # Cross-validation
        print("Performing cross-validation...")
        cv_results = self.cross_validate(model, X_processed, y_processed)
        
        # Evaluate model
        print("Evaluating model...")
        metrics = self.evaluate_model(model, X_test, y_test)
        metrics.update(cv_results)
        
        # Save results
        save_dir = self.config.get('output_dir', 'models/classification/random_forest')
        self.save_model(model, metrics, save_dir)
        self.plot_results(model, X_test, y_test, save_dir)
        
        print("Training completed successfully!")
        print(f"Test Accuracy: {metrics['accuracy']:.4f}")
        print(f"ROC AUC: {metrics['roc_auc']:.4f}")
        
        return model, metrics


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Train Random Forest Classifier')
    parser.add_argument('--config', required=True, help='Path to configuration file')
    args = parser.parse_args()
    
    # Create trainer
    trainer = RandomForestTrainer(args.config)
    
    # Train model
    model, metrics = trainer.train()
    
    return model, metrics


if __name__ == "__main__":
    main()
