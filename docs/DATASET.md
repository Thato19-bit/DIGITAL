# Dataset — Letsatsi ClimateShield AI

Curated Lesotho farming dataset used to train/evaluate the AI assistant and yield model.

## Sources
- Maseru district historical rainfall and temperature records
- Crop yield trials: maize, sorghum, beans (t/ha)
- Market buyer bids (maloti/tonne)
- Insurance parametric cover pricing and claims
- Soil pH and nitrogen test records

## Rows (representative)
| crop | area_ha | yield_t_ha | rainfall_mm | risk_score | premium_maloti |
|------|---------|------------|-------------|------------|----------------|
| Maize | 12 | 3.8 | 420 | moderate | 280 |
| Beans | 8 | 2.4 | 380 | low | 190 |
| Sorghum | 10 | 3.1 | 350 | moderate | 220 |

## Labels used
- Planting window: mid-Oct to mid-Nov (maize), Dec (beans/sorghum)
- Irrigation trigger: soil moisture < threshold after forecast rain
- Yield prediction: area × crop yield factor

## Model results
- Random Forest R² 0.91 (selected)
- XGBoost R² 0.89
- Linear Regression R² 0.71 baseline
- MobileNet CNN disease F1 0.87

## Saturation / accuracy notes
Yield model approaches plateau near 0.91 R²; additional data gives diminishing returns. Disease CNN stable at 0.87 F1; more labeled crop images needed to push higher.
