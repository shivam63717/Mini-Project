# Model Training Directory

This directory contains scripts and utilities for training machine learning models for the CyberML platform.

## Structure

```
training/
├── README.md                 # This file
├── scripts/                  # Training scripts
│   ├── classification/       # Classification models
│   ├── regression/          # Regression models
│   ├── clustering/          # Clustering models
│   ├── anomaly_detection/   # Anomaly detection models
│   └── deep_learning/       # Deep learning models
├── configs/                 # Configuration files
│   ├── datasets/           # Dataset configurations
│   ├── models/             # Model configurations
│   └── training/           # Training configurations
├── utils/                   # Utility functions
│   ├── data_loader.py      # Data loading utilities
│   ├── preprocessing.py    # Data preprocessing
│   ├── evaluation.py       # Model evaluation
│   └── visualization.py    # Result visualization
├── models/                  # Trained model artifacts
│   ├── classification/     # Classification models
│   ├── regression/         # Regression models
│   ├── clustering/         # Clustering models
│   └── anomaly_detection/  # Anomaly detection models
├── logs/                    # Training logs
├── results/                 # Training results and metrics
└── requirements.txt         # Python dependencies
```

## Getting Started

### 1. Setup Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Training

Edit configuration files in `configs/` directory:

- `configs/datasets/` - Dataset paths and preprocessing settings
- `configs/models/` - Model hyperparameters and architecture
- `configs/training/` - Training parameters and optimization settings

### 3. Run Training

```bash
# Classification example
python scripts/classification/train_classifier.py --config configs/classification/malware_detection.yaml

# Regression example
python scripts/regression/train_regressor.py --config configs/regression/network_prediction.yaml

# Clustering example
python scripts/clustering/train_clusterer.py --config configs/clustering/behavior_clustering.yaml

# Anomaly detection example
python scripts/anomaly_detection/train_anomaly_detector.py --config configs/anomaly_detection/network_anomalies.yaml
```

## Training Scripts

### Classification Models

- **Random Forest**: `scripts/classification/random_forest.py`
- **XGBoost**: `scripts/classification/xgboost.py`
- **SVM**: `scripts/classification/svm.py`
- **Neural Network**: `scripts/classification/neural_network.py`

### Regression Models

- **Linear Regression**: `scripts/regression/linear_regression.py`
- **Random Forest**: `scripts/regression/random_forest.py`
- **XGBoost**: `scripts/regression/xgboost.py`
- **Neural Network**: `scripts/regression/neural_network.py`

### Clustering Models

- **K-Means**: `scripts/clustering/kmeans.py`
- **DBSCAN**: `scripts/clustering/dbscan.py`
- **Hierarchical**: `scripts/clustering/hierarchical.py`
- **Gaussian Mixture**: `scripts/clustering/gaussian_mixture.py`

### Anomaly Detection Models

- **Isolation Forest**: `scripts/anomaly_detection/isolation_forest.py`
- **One-Class SVM**: `scripts/anomaly_detection/one_class_svm.py`
- **Autoencoder**: `scripts/anomaly_detection/autoencoder.py`
- **LSTM**: `scripts/anomaly_detection/lstm.py`

### Deep Learning Models

- **CNN**: `scripts/deep_learning/cnn.py`
- **RNN/LSTM**: `scripts/deep_learning/rnn.py`
- **Transformer**: `scripts/deep_learning/transformer.py`
- **GAN**: `scripts/deep_learning/gan.py`

## Configuration Files

### Dataset Configuration Example

```yaml
# configs/datasets/cybersecurity_logs.yaml
name: "Cybersecurity Logs"
path: "/data/cybersecurity_logs.csv"
format: "csv"
target_column: "threat_level"
features:
  - "packet_size"
  - "duration"
  - "port"
  - "protocol"
  - "source_ip"
  - "destination_ip"
preprocessing:
  scaling: true
  encoding: true
  feature_selection: true
  outlier_removal: true
```

### Model Configuration Example

```yaml
# configs/models/random_forest.yaml
name: "Random Forest Classifier"
algorithm: "random_forest"
hyperparameters:
  n_estimators: 100
  max_depth: 10
  min_samples_split: 2
  min_samples_leaf: 1
  random_state: 42
  n_jobs: -1
```

### Training Configuration Example

```yaml
# configs/training/classification.yaml
train_test_split: 0.8
cross_validation:
  enabled: true
  folds: 5
  strategy: "stratified"
optimization:
  enabled: true
  method: "grid_search"
  max_iterations: 100
early_stopping:
  enabled: true
  patience: 10
  min_delta: 0.001
```

## Utility Functions

### Data Loading (`utils/data_loader.py`)

```python
from utils.data_loader import load_dataset, split_data

# Load dataset
X, y = load_dataset("cybersecurity_logs")

# Split data
X_train, X_test, y_train, y_test = split_data(X, y, test_size=0.2)
```

### Preprocessing (`utils/preprocessing.py`)

```python
from utils.preprocessing import preprocess_data

# Preprocess data
X_processed = preprocess_data(X, scaling=True, encoding=True)
```

### Evaluation (`utils/evaluation.py`)

```python
from utils.evaluation import evaluate_model, plot_confusion_matrix

# Evaluate model
metrics = evaluate_model(model, X_test, y_test)

# Plot confusion matrix
plot_confusion_matrix(y_test, y_pred)
```

### Visualization (`utils/visualization.py`)

```python
from utils.visualization import plot_training_history, plot_feature_importance

# Plot training history
plot_training_history(history)

# Plot feature importance
plot_feature_importance(model, feature_names)
```

## Model Artifacts

Trained models are saved in the `models/` directory with the following structure:

```
models/
├── classification/
│   ├── random_forest/
│   │   ├── model.pkl
│   │   ├── scaler.pkl
│   │   ├── encoder.pkl
│   │   └── metadata.json
│   └── xgboost/
│       ├── model.pkl
│       ├── scaler.pkl
│       └── metadata.json
├── regression/
│   └── linear_regression/
│       ├── model.pkl
│       └── metadata.json
└── clustering/
    └── kmeans/
        ├── model.pkl
        └── metadata.json
```

## Training Logs

Training logs are saved in the `logs/` directory with timestamps:

```
logs/
├── 2024-01-15_10-30-00_classification.log
├── 2024-01-15_11-45-00_regression.log
└── 2024-01-15_14-20-00_clustering.log
```

## Results and Metrics

Training results and metrics are saved in the `results/` directory:

```
results/
├── classification/
│   ├── accuracy_scores.json
│   ├── confusion_matrix.png
│   ├── roc_curve.png
│   └── feature_importance.png
├── regression/
│   ├── mse_scores.json
│   ├── r2_scores.json
│   └── residual_plot.png
└── clustering/
    ├── silhouette_scores.json
    ├── cluster_plot.png
    └── elbow_plot.png
```

## Integration with CyberML Platform

The training scripts integrate with the CyberML platform through:

1. **Redis Database**: Training jobs are stored and tracked in Redis
2. **API Endpoints**: Training progress is reported via API calls
3. **Model Registry**: Trained models are registered in the model registry
4. **Experiment Tracking**: Training runs are tracked as experiments

### Example Integration

```python
from lib.database.redis import RedisService
from lib.models.TrainingJob import TrainingJobModel

# Create training job
job = await TrainingJobModel.create({
    name: "Malware Detection Model",
    description: "Binary classification for malware detection",
    type: "classification",
    algorithm: "random_forest",
    datasetId: "dataset_123",
    hyperparameters: {
        "n_estimators": 100,
        "max_depth": 10
    },
    configuration: {
        "trainTestSplit": 0.8,
        "crossValidation": {
            "enabled": True,
            "folds": 5
        }
    }
})

# Update progress
await TrainingJobModel.updateProgress(job.id, 50, 300)

# Complete training
await TrainingJobModel.complete(job.id, {
    "accuracy": 0.942,
    "precision": 0.938,
    "recall": 0.945,
    "f1Score": 0.941
})
```

## Best Practices

1. **Version Control**: Always version your training scripts and configurations
2. **Reproducibility**: Set random seeds for reproducible results
3. **Validation**: Use cross-validation for robust model evaluation
4. **Monitoring**: Log training progress and metrics
5. **Documentation**: Document model performance and limitations
6. **Testing**: Test models on unseen data before deployment
7. **Security**: Validate input data and sanitize outputs

## Troubleshooting

### Common Issues

1. **Memory Issues**: Reduce batch size or use data generators
2. **Slow Training**: Use GPU acceleration or distributed training
3. **Poor Performance**: Check data quality and feature engineering
4. **Overfitting**: Use regularization or early stopping
5. **Underfitting**: Increase model complexity or training time

### Debug Mode

Enable debug mode for detailed logging:

```bash
export DEBUG=1
python scripts/classification/train_classifier.py --config configs/classification/malware_detection.yaml
```

## Contributing

1. Follow the existing code structure and naming conventions
2. Add comprehensive docstrings and comments
3. Include unit tests for new functionality
4. Update this README when adding new features
5. Ensure all scripts work with the CyberML platform integration

## License

This training directory is part of the CyberML platform and follows the same license terms.
