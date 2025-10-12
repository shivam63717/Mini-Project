
from __future__ import annotations
import csv
import io
from pathlib import Path
from typing import List, Dict, Any, Iterable, Optional, Tuple
import pandas as pd

class CSVIngestError(Exception):
    pass

def sniff_delimiter(sample: str) -> str:
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=[",",";","|","\t"])
        return dialect.delimiter
    except Exception:
        return ","

def load_csv(
    source: str | Path | bytes,
    required_cols: Optional[Iterable[str]] = None,
    allow_empty: bool = False,
    lowercase_headers: bool = True,
) -> pd.DataFrame:
    """
    Load a CSV from path, raw bytes, or string, auto-detect delimiter and validate columns.
    """
    if isinstance(source, (str, Path)) and Path(str(source)).exists():
        text = Path(str(source)).read_text(encoding="utf-8", errors="ignore")
    elif isinstance(source, bytes):
        text = source.decode("utf-8", errors="ignore")
    else:
        text = str(source)

    sample = text[:4000]
    delimiter = sniff_delimiter(sample)

    try:
        df = pd.read_csv(io.StringIO(text), delimiter=delimiter)
    except Exception as e:
        raise CSVIngestError(f"Failed to parse CSV: {e}") from e

    if df.empty and not allow_empty:
        raise CSVIngestError("CSV is empty")

    if lowercase_headers:
        df.columns = [c.strip().lower() for c in df.columns]

    if required_cols:
        missing = [c for c in required_cols if c.lower() not in df.columns]
        if missing:
            raise CSVIngestError(f"Missing required columns: {missing}")

    df = df.drop_duplicates()
    return df

def summarize_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    summary: Dict[str, Any] = {
        "row_count": int(len(df)),
        "col_count": int(len(df.columns)),
        "columns": [],
    }
    for col in df.columns:
        s = df[col]
        col_meta = {
            "name": col,
            "dtype": str(s.dtype),
            "non_null": int(s.count()),
            "nulls": int(s.isna().sum()),
            "null_pct": float(round((s.isna().mean()) * 100, 2)),
        }
        if pd.api.types.is_numeric_dtype(s):
            col_meta.update({
                "min": float(s.min()) if s.count() else None,
                "max": float(s.max()) if s.count() else None,
                "mean": float(s.mean()) if s.count() else None,
                "std": float(s.std()) if s.count() else None,
            })
        else:
            col_meta["unique"] = int(s.nunique(dropna=True))
        summary["columns"].append(col_meta)
    return summary