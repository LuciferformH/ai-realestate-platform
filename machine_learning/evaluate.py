"""
Model Evaluation and Visualization
Provides EDA functions, learning curves, and evaluation charts.
"""
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import learning_curve
from sklearn.preprocessing import LabelEncoder
from scipy import stats
import os
import logging

from config import DATA_PATH, OUTPUT_DIR, RANDOM_STATE

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

sns.set_style("whitegrid")
sns.set_palette("deep")


def create_confusion_matrix(y_true, y_pred, output_dir: str = OUTPUT_DIR):
    bins = np.linspace(min(y_true.min(), y_pred.min()), max(y_true.max(), y_pred.max()), 11)
    y_true_binned = np.digitize(y_true, bins)
    y_pred_binned = np.digitize(y_pred, bins)

    labels = [f"{bins[i]:.0f}-{bins[i+1]:.0f}" for i in range(len(bins) - 1)]
    max_label = len(labels)
    mask = (y_true_binned > 0) & (y_true_binned <= max_label) & (y_pred_binned > 0) & (y_pred_binned <= max_label)
    y_true_filtered = y_true_binned[mask] - 1
    y_pred_filtered = y_pred_binned[mask] - 1

    unique_labels = sorted(set(y_true_filtered) | set(y_pred_filtered))
    filtered_labels = [labels[i] for i in unique_labels]

    matrix = np.zeros((len(unique_labels), len(unique_labels)), dtype=int)
    label_map = {v: i for i, v in enumerate(unique_labels)}
    for t, p in zip(y_true_filtered, y_pred_filtered):
        matrix[label_map[t], label_map[p]] += 1

    fig, ax = plt.subplots(figsize=(12, 10))
    sns.heatmap(matrix, annot=True, fmt="d", cmap="Blues", xticklabels=filtered_labels,
                yticklabels=filtered_labels, ax=ax, linewidths=0.5, linecolor="white")
    ax.set_xlabel("Predicted Price Range ($)", fontsize=11)
    ax.set_ylabel("Actual Price Range ($)", fontsize=11)
    ax.set_title("Price Range Confusion Matrix", fontsize=13, fontweight="bold")
    plt.xticks(rotation=45, ha="right", fontsize=9)
    plt.yticks(rotation=0, fontsize=9)
    plt.tight_layout()

    path = os.path.join(output_dir, "confusion_matrix.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved confusion matrix: %s", path)
    return path


def create_learning_curves(model, X, y, output_dir: str = OUTPUT_DIR, model_name: str = "model"):
    train_sizes_abs, train_scores, val_scores = learning_curve(
        model, X, y, cv=5, scoring="r2",
        train_sizes=np.linspace(0.1, 1.0, 10),
        random_state=RANDOM_STATE, n_jobs=-1,
    )

    train_mean = train_scores.mean(axis=1)
    train_std = train_scores.std(axis=1)
    val_mean = val_scores.mean(axis=1)
    val_std = val_scores.std(axis=1)

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.fill_between(train_sizes_abs, train_mean - train_std, train_mean + train_std, alpha=0.15, color="blue")
    ax.fill_between(train_sizes_abs, val_mean - val_std, val_mean + val_std, alpha=0.15, color="orange")
    ax.plot(train_sizes_abs, train_mean, "o-", color="blue", linewidth=2, markersize=5, label="Training Score")
    ax.plot(train_sizes_abs, val_mean, "o-", color="orange", linewidth=2, markersize=5, label="Validation Score")
    ax.set_xlabel("Training Set Size", fontsize=11)
    ax.set_ylabel("R² Score", fontsize=11)
    ax.set_title(f"Learning Curves - {model_name}", fontsize=13, fontweight="bold")
    ax.legend(loc="lower right", fontsize=10)
    ax.grid(True, alpha=0.3)
    ax.set_ylim(min(train_mean.min(), val_mean.min()) - 0.1, 1.05)
    plt.tight_layout()

    path = os.path.join(output_dir, f"{model_name}_learning_curves.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved learning curves: %s", path)
    return path


def create_feature_correlation_matrix(df: pd.DataFrame, output_dir: str = OUTPUT_DIR):
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 2:
        logger.warning("Not enough numeric columns for correlation matrix.")
        return None

    max_features = 15
    if numeric_df.shape[1] > max_features:
        top_corr = numeric_df.corrwith(numeric_df["price"]).abs().sort_values(ascending=False)
        cols = top_corr.head(max_features).index.tolist()
        numeric_df = numeric_df[cols]

    corr = numeric_df.corr()

    fig, ax = plt.subplots(figsize=(12, 10))
    mask = np.triu(np.ones_like(corr, dtype=bool), k=1)
    sns.heatmap(corr, mask=mask, annot=True, fmt=".2f", cmap="RdBu_r", center=0,
                vmin=-1, vmax=1, ax=ax, linewidths=0.5, linecolor="white",
                annot_kws={"size": 8})
    ax.set_title("Feature Correlation Matrix", fontsize=13, fontweight="bold")
    plt.xticks(rotation=45, ha="right", fontsize=9)
    plt.yticks(rotation=0, fontsize=9)
    plt.tight_layout()

    path = os.path.join(output_dir, "correlation_matrix.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved correlation matrix: %s", path)
    return path


def create_price_distribution(df: pd.DataFrame, output_dir: str = OUTPUT_DIR):
    if "price" not in df.columns:
        logger.warning("'price' column not found.")
        return None

    price = df["price"]
    log_price = np.log1p(price)

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    axes[0, 0].hist(price, bins=50, color="steelblue", edgecolor="black", linewidth=0.5, alpha=0.8)
    axes[0, 0].axvline(price.mean(), color="red", linestyle="--", linewidth=1.5, label=f"Mean: ${price.mean():,.0f}")
    axes[0, 0].axvline(price.median(), color="green", linestyle="--", linewidth=1.5, label=f"Median: ${price.median():,.0f}")
    axes[0, 0].set_xlabel("Price ($)", fontsize=11)
    axes[0, 0].set_ylabel("Frequency", fontsize=11)
    axes[0, 0].set_title("Price Distribution", fontsize=12, fontweight="bold")
    axes[0, 0].legend(fontsize=9)
    axes[0, 0].grid(True, alpha=0.3)

    axes[0, 1].hist(log_price, bins=50, color="coral", edgecolor="black", linewidth=0.5, alpha=0.8)
    axes[0, 1].set_xlabel("Log(Price + 1)", fontsize=11)
    axes[0, 1].set_ylabel("Frequency", fontsize=11)
    axes[0, 1].set_title("Log-Transformed Price Distribution", fontsize=12, fontweight="bold")
    axes[0, 1].grid(True, alpha=0.3)

    axes[1, 0].boxplot(price.values, vert=True, patch_artist=True,
                       boxprops=dict(facecolor="steelblue", alpha=0.7))
    axes[1, 0].set_ylabel("Price ($)", fontsize=11)
    axes[1, 0].set_title("Price Box Plot", fontsize=12, fontweight="bold")
    axes[1, 0].grid(True, alpha=0.3)

    stats.probplot(price, dist="norm", plot=axes[1, 1])
    axes[1, 1].set_title("Q-Q Plot (Normality Check)", fontsize=12, fontweight="bold")
    axes[1, 1].grid(True, alpha=0.3)

    skewness = price.skew()
    kurtosis_val = price.kurtosis()
    _, p_value = stats.normaltest(price.dropna())

    axes[1, 1].text(0.05, 0.95, f"Skewness: {skewness:.2f}\nKurtosis: {kurtosis_val:.2f}\nNormality p-value: {p_value:.4f}",
                    transform=axes[1, 1].transAxes, verticalalignment="top",
                    fontsize=9, bbox=dict(boxstyle="round", facecolor="wheat", alpha=0.5))

    fig.suptitle("Price Distribution Analysis", fontsize=14, fontweight="bold", y=1.02)
    plt.tight_layout()

    path = os.path.join(output_dir, "price_distribution.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved price distribution: %s", path)
    return path


def create_outlier_detection(df: pd.DataFrame, output_dir: str = OUTPUT_DIR):
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if "price" in numeric_cols:
        numeric_cols.remove("price")
        numeric_cols.append("price")

    n_cols = min(3, len(numeric_cols))
    n_rows = (len(numeric_cols) + n_cols - 1) // n_cols

    fig, axes = plt.subplots(n_rows, n_cols, figsize=(6 * n_cols, 5 * n_rows))
    if n_rows == 1 and n_cols == 1:
        axes = np.array([[axes]])
    elif n_rows == 1:
        axes = axes.reshape(1, -1)
    elif n_cols == 1:
        axes = axes.reshape(-1, 1)

    outlier_summary = {}

    for idx, col in enumerate(numeric_cols):
        row_idx = idx // n_cols
        col_idx = idx % n_cols
        ax = axes[row_idx, col_idx]

        data = df[col].dropna()
        Q1 = data.quantile(0.25)
        Q3 = data.quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR

        outliers = data[(data < lower) | (data > upper)]
        outlier_count = len(outliers)
        outlier_pct = (outlier_count / len(data) * 100) if len(data) > 0 else 0
        outlier_summary[col] = {"count": outlier_count, "percentage": round(outlier_pct, 2)}

        bp = ax.boxplot(data.values, vert=True, patch_artist=True,
                        boxprops=dict(facecolor="lightblue", alpha=0.7),
                        flierprops=dict(marker="o", markerfacecolor="red", markersize=4, alpha=0.5))

        ax.set_title(f"{col}\nOutliers: {outlier_count} ({outlier_pct:.1f}%)", fontsize=10, fontweight="bold")
        ax.set_ylabel("Value", fontsize=9)
        ax.grid(True, alpha=0.3)

    for idx in range(len(numeric_cols), n_rows * n_cols):
        row_idx = idx // n_cols
        col_idx = idx % n_cols
        axes[row_idx, col_idx].set_visible(False)

    fig.suptitle("Outlier Detection (IQR Method)", fontsize=14, fontweight="bold", y=1.02)
    plt.tight_layout()

    path = os.path.join(output_dir, "outlier_detection.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved outlier detection: %s", path)

    summary_path = os.path.join(output_dir, "outlier_summary.txt")
    with open(summary_path, "w") as f:
        f.write("Outlier Detection Summary (IQR Method)\n")
        f.write("=" * 50 + "\n")
        for col, info in outlier_summary.items():
            f.write(f"{col}: {info['count']} outliers ({info['percentage']}%)\n")

    return path


def create_missing_value_analysis(df: pd.DataFrame, output_dir: str = OUTPUT_DIR):
    missing = df.isnull().sum()
    missing_pct = (missing / len(df) * 100).round(2)
    missing_df = pd.DataFrame({"Missing Count": missing, "Missing %": missing_pct})
    missing_df = missing_df[missing_df["Missing Count"] > 0].sort_values("Missing %", ascending=False)

    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    if len(missing_df) > 0:
        axes[0].barh(missing_df.index, missing_df["Missing %"], color="coral", edgecolor="black", linewidth=0.5)
        axes[0].set_xlabel("Missing Percentage (%)", fontsize=11)
        axes[0].set_title("Missing Values by Column", fontsize=12, fontweight="bold")
        axes[0].grid(axis="x", alpha=0.3)

        for i, (idx, row) in enumerate(missing_df.iterrows()):
            axes[0].text(row["Missing %"] + 0.5, i, f"{row['Missing %']:.1f}%", va="center", fontsize=9)
    else:
        axes[0].text(0.5, 0.5, "No Missing Values!", transform=axes[0].transAxes,
                     ha="center", va="center", fontsize=14, fontweight="bold", color="green")
        axes[0].set_title("Missing Values by Column", fontsize=12, fontweight="bold")

    missing_matrix = df.isnull().astype(int)
    if missing_matrix.sum().sum() > 0:
        sns.heatmap(missing_matrix, cbar=True, yticklabels=False, cmap="YlOrRd", ax=axes[1],
                    linewidths=0.1, linecolor="white")
        axes[1].set_title("Missing Value Pattern", fontsize=12, fontweight="bold")
        axes[1].set_xlabel("Columns")
    else:
        axes[1].text(0.5, 0.5, "No Missing Values!", transform=axes[1].transAxes,
                     ha="center", va="center", fontsize=14, fontweight="bold", color="green")
        axes[1].set_title("Missing Value Pattern", fontsize=12, fontweight="bold")

    total_cells = df.shape[0] * df.shape[1]
    total_missing = df.isnull().sum().sum()
    completeness = ((total_cells - total_missing) / total_cells * 100) if total_cells > 0 else 100

    fig.suptitle(f"Missing Value Analysis | Data Completeness: {completeness:.1f}%",
                 fontsize=14, fontweight="bold", y=1.02)
    plt.tight_layout()

    path = os.path.join(output_dir, "missing_values.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved missing value analysis: %s", path)
    return path


def create_feature_distributions(df: pd.DataFrame, output_dir: str = OUTPUT_DIR):
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if "price" in numeric_cols:
        numeric_cols.remove("price")

    if not numeric_cols:
        logger.warning("No numeric features to plot.")
        return None

    n_cols = min(3, len(numeric_cols))
    n_rows = (len(numeric_cols) + n_cols - 1) // n_cols

    fig, axes = plt.subplots(n_rows, n_cols, figsize=(6 * n_cols, 4 * n_rows))
    if n_rows == 1 and n_cols == 1:
        axes = np.array([[axes]])
    elif n_rows == 1:
        axes = axes.reshape(1, -1)
    elif n_cols == 1:
        axes = axes.reshape(-1, 1)

    for idx, col in enumerate(numeric_cols):
        row_idx = idx // n_cols
        col_idx = idx % n_cols
        ax = axes[row_idx, col_idx]

        ax.hist(df[col].dropna(), bins=40, color="steelblue", edgecolor="black", linewidth=0.5, alpha=0.8)
        ax.axvline(df[col].mean(), color="red", linestyle="--", linewidth=1.2, label=f"Mean: {df[col].mean():.2f}")
        ax.axvline(df[col].median(), color="green", linestyle="--", linewidth=1.2, label=f"Median: {df[col].median():.2f}")
        ax.set_title(col, fontsize=11, fontweight="bold")
        ax.legend(fontsize=8)
        ax.grid(True, alpha=0.3)

    for idx in range(len(numeric_cols), n_rows * n_cols):
        row_idx = idx // n_cols
        col_idx = idx % n_cols
        axes[row_idx, col_idx].set_visible(False)

    fig.suptitle("Feature Distributions", fontsize=14, fontweight="bold", y=1.02)
    plt.tight_layout()

    path = os.path.join(output_dir, "feature_distributions.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved feature distributions: %s", path)
    return path


def create_scatter_matrix(df: pd.DataFrame, output_dir: str = OUTPUT_DIR):
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if "price" in numeric_cols:
        numeric_cols.remove("price")
        numeric_cols = numeric_cols[:5]
        numeric_cols.append("price")

    if len(numeric_cols) < 2:
        logger.warning("Not enough numeric columns for scatter matrix.")
        return None

    fig, axes = plt.subplots(len(numeric_cols), len(numeric_cols), figsize=(4 * len(numeric_cols), 4 * len(numeric_cols)))

    for i, col_y in enumerate(numeric_cols):
        for j, col_x in enumerate(numeric_cols):
            ax = axes[i, j] if len(numeric_cols) > 1 else axes
            if i == j:
                ax.hist(df[col_x].dropna(), bins=30, color="steelblue", edgecolor="black", linewidth=0.5, alpha=0.7)
                ax.set_title(col_x, fontsize=9, fontweight="bold")
            else:
                ax.scatter(df[col_x], df[col_y], alpha=0.3, s=8, c="steelblue")
                if i == len(numeric_cols) - 1:
                    ax.set_xlabel(col_x, fontsize=8)
                if j == 0:
                    ax.set_ylabel(col_y, fontsize=8)
            ax.grid(True, alpha=0.2)

    fig.suptitle("Feature Scatter Matrix", fontsize=14, fontweight="bold", y=1.01)
    plt.tight_layout()

    path = os.path.join(output_dir, "scatter_matrix.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved scatter matrix: %s", path)
    return path


def run_full_eda(df: pd.DataFrame, output_dir: str = OUTPUT_DIR):
    os.makedirs(output_dir, exist_ok=True)
    logger.info("Running full EDA on dataset (%d rows, %d columns)...", df.shape[0], df.shape[1])

    report = {
        "dataset_shape": df.shape,
        "columns": list(df.columns),
        "dtypes": df.dtypes.to_dict(),
        "numeric_summary": df.describe().to_dict(),
        "missing_values": df.isnull().sum().to_dict(),
    }

    results = {}

    logger.info("1/7 Missing Value Analysis...")
    results["missing_values"] = create_missing_value_analysis(df, output_dir)

    logger.info("2/7 Price Distribution...")
    results["price_distribution"] = create_price_distribution(df, output_dir)

    logger.info("3/7 Correlation Matrix...")
    results["correlation_matrix"] = create_feature_correlation_matrix(df, output_dir)

    logger.info("4/7 Outlier Detection...")
    results["outlier_detection"] = create_outlier_detection(df, output_dir)

    logger.info("5/7 Feature Distributions...")
    results["feature_distributions"] = create_feature_distributions(df, output_dir)

    logger.info("6/7 Scatter Matrix...")
    results["scatter_matrix"] = create_scatter_matrix(df, output_dir)

    if "price" in df.columns:
        logger.info("7/7 Confusion Matrix (using random predictions for demonstration)...")
        y_true = df["price"].values
        noise = np.random.normal(0, y_true.std() * 0.2, len(y_true))
        y_pred = y_true + noise
        results["confusion_matrix"] = create_confusion_matrix(y_true, y_pred, output_dir)
    else:
        logger.info("7/7 Skipped confusion matrix (no price column).")

    report_path = os.path.join(output_dir, "eda_report.txt")
    with open(report_path, "w") as f:
        f.write("Exploratory Data Analysis Report\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Dataset Shape: {df.shape[0]} rows x {df.shape[1]} columns\n\n")
        f.write("Column Data Types:\n")
        for col, dtype in df.dtypes.items():
            f.write(f"  {col}: {dtype}\n")
        f.write(f"\nMissing Values:\n")
        total_missing = df.isnull().sum().sum()
        f.write(f"  Total missing values: {total_missing}\n")
        if total_missing > 0:
            for col in df.columns:
                miss = df[col].isnull().sum()
                if miss > 0:
                    f.write(f"  {col}: {miss} ({miss/len(df)*100:.1f}%)\n")
        f.write(f"\nNumeric Summary:\n{df.describe().to_string()}\n\n")
        f.write("Generated Charts:\n")
        for name, path in results.items():
            status = "OK" if path else "SKIPPED"
            f.write(f"  {name}: {status} -> {path}\n")

    logger.info("EDA Report saved to: %s", report_path)
    logger.info("Full EDA completed. Generated %d charts.", sum(1 for v in results.values() if v is not None))
    return results


def main():
    logger.info("Model Evaluation & Visualization Module")
    logger.info("=" * 50)

    if os.path.exists(DATA_PATH):
        logger.info("Loading dataset from %s", DATA_PATH)
        df = pd.read_csv(DATA_PATH)
    else:
        logger.warning("Dataset not found at %s. Generating synthetic data...", DATA_PATH)
        from train import _generate_synthetic_data
        df = _generate_synthetic_data()

    logger.info("Dataset loaded: %d rows, %d columns", df.shape[0], df.shape[1])
    run_full_eda(df, OUTPUT_DIR)

    logger.info("=" * 50)
    logger.info("Evaluation module finished. All outputs saved to: %s", OUTPUT_DIR)


if __name__ == "__main__":
    main()
