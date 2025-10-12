
import io
from analysis.csv_analysis import run_csv_analysis

CSV_SAMPLE = """id,value,label
1,10,A
2,11,B
3,11,B
4,,A
5,12,B
"""

def test_basic_analysis():
    result = run_csv_analysis(CSV_SAMPLE, required_cols=["id","value","label"], target_col="label")
    assert result["summary"]["row_count"] == 5
    assert any(c["name"] == "value" for c in result["summary"]["columns"])
    assert "issues" in result