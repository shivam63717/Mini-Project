
from __future__ import annotations
from typing import Any, Dict, Optional, Iterable
import pandas as pd

from utils.csv_ingest import load_csv, summarize_dataframe, CSVIngestError

def run_csv_analysis(
    source,
    required_cols: Optional[Iterable[str]] = None,
    target_col: Optional[str] = None,
) -> Dict[str, Any]:
    df = load_csv(source, required_cols=required_cols)
    summary = summarize_dataframe(df)

    analysis: Dict[str, Any] = {
        "summary": summary,
        "target": target_col,
        "issues": [],
        "recommendations": [],
    }

    if target_col and target_col.lower() in df.columns:
        tgt = df[target_col.lower()]
        if tgt.isna().any():
            analysis["issues"].append("Target column has missing values.")
        if tgt.nunique() == 1:
            analysis["issues"].append("Target column has only one class/value.")
        if tgt.nunique() > 100 and not pd.api.types.is_numeric_dtype(tgt):
            analysis["recommendations"].append("Consider encoding high-cardinality target.")
    else:
        if target_col:
            analysis["issues"].append("Specified target column not found.")

    # Simple leakage / constant feature checks
    constant_cols = [c for c in df.columns if df[c].nunique(dropna=True) <= 1]
    if constant_cols:
        analysis["issues"].append(f"Constant / near-constant columns: {constant_cols}")

    high_null_cols = [
        c for c in df.columns if df[c].isna().mean() > 0.4
    ]
    if high_null_cols:
        analysis["recommendations"].append(
            f"Columns with >40% nulls: {high_null_cols} (consider dropping or imputing)"
        )

    return analysis

def cli_entry():
    import argparse, json
    p = argparse.ArgumentParser(description="CSV analysis utility")
    p.add_argument("path", help="Path to CSV file")
    p.add_argument("--target", help="Target column", default=None)
    p.add_argument("--require", nargs="*", help="Required columns")
    args = p.parse_args()

    try:
        result = run_csv_analysis(
            args.path,
            required_cols=args.require,
            target_col=args.target,
        )
        print(json.dumps(result, indent=2))
    except CSVIngestError as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    cli_entry()