from src.core.data_loader import DataLoader
from src.core.data_processor import DataProcessor
from src.core.analyzer import Analyzer
from src.visualization.map_builder import MapBuilder
from src.utils.helpers import ensure_dir, save_report
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    # 1. Charger les données
    loader = DataLoader()
    quartiers = loader.load_quartiers()
    stats = loader.compute_zonal_stats(quartiers)

    # 2. Nettoyer et enrichir les données
    quartiers["uhi_mean"] = DataProcessor.clean_uhi_values(stats)
    quartiers = DataProcessor.add_analysis_columns(quartiers)

    # 3. Analyser les données
    summary = Analyzer.get_summary_stats(quartiers)
    logger.info(f"Statistiques UHI: {summary}")

    # 4. Construire la carte
    map_builder = MapBuilder(quartiers)
    m = map_builder.build_base_map()
    m = map_builder.add_uhi_layer(m)
    m = map_builder.add_title(m)

    # 5. Sauvegarder les résultats
    ensure_dir("outputs")
    m.save("outputs/carte_uhi_marseille.html")
    save_report(summary, "outputs/analyse_uhi.json")

    logger.info("✅ Carte et rapport générés avec succès!")

if __name__ == "__main__":
    main()
