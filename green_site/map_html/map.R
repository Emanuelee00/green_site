library(ggplot2)
library(raster)
library(patchwork)

# ══════════════════════════════════════════════════════
# 1. CONFIGURATION
# ══════════════════════════════════════════════════════

BASE <- "./browser_images/"
BBOX <- extent(5.25, 5.55, 43.20, 43.42)

f_ndvi  <- paste0(BASE, "2023-08-22-00:00_2023-08-22-23:59_Sentinel-2_L2A_NDVI.tiff")
f_ndwi  <- paste0(BASE, "2023-08-22-00:00_2023-08-22-23:59_Sentinel-2_L2A_NDWI.tiff")
f_urban <- paste0(BASE, "2023-08-22-00:00_2023-08-22-23:59_Sentinel-2_L2A_False_color_(urban).tiff")
f_swir  <- paste0(BASE, "2023-08-22-00:00_2023-08-22-23:59_Sentinel-2_L2A_SWIR.tiff")

# ══════════════════════════════════════════════════════
# 2. FONCTIONS UTILITAIRES
# ══════════════════════════════════════════════════════

charger_raster <- function(fichier) {
  r  <- raster(fichier) |> crop(BBOX) |> aggregate(fact = 3)
  df <- as.data.frame(r, xy = TRUE) |> na.omit()
  names(df) <- c("lon", "lat", "val")
  df$val <- (df$val - min(df$val)) / (max(df$val) - min(df$val))
  df
}

faire_carte <- function(df, palette, titre, sous_titre, legende_titre, labels_legende) {
  ggplot(df, aes(x = lon, y = lat, fill = val)) +
    geom_raster(interpolate = TRUE) +
    scale_fill_gradientn(
      colors = palette, limits = c(0, 1), breaks = c(0, 0.5, 1),
      labels = labels_legende, name = legende_titre, na.value = "transparent",
      guide  = guide_colorbar(barwidth = 0.8, barheight = 7, title.position = "top", title.hjust = 0.5)
    ) +
    coord_quickmap(xlim = c(5.25, 5.55), ylim = c(43.20, 43.42), expand = FALSE) +
    labs(title = titre, subtitle = sous_titre, x = NULL, y = NULL) +
    theme(
      text          = element_text(size = 18),
      plot.title    = element_text(size = 22, face = "bold"),
      plot.subtitle = element_text(size = 16),
      legend.title  = element_text(size = 15),
      legend.text   = element_text(size = 13),
      axis.text     = element_text(size = 11)
    )
}

# ══════════════════════════════════════════════════════
# 3. INDICES SPECTRAUX
# ══════════════════════════════════════════════════════

pal_ndvi  <- rev(colorRampPalette(c("#D4C5A9", "#A8B86A", "#4E9B3F", "#145214"))(256))
pal_ndwi  <- rev(colorRampPalette(c("#F5F0E8", "#A8D4E6", "#3A8FBF", "#0A3D6B"))(256))
pal_urban <- colorRampPalette(c("#145214", "#C8B080", "#B05020", "#2C2C2C"))(256)
pal_swir  <- rev(colorRampPalette(c("#D4C5A9", "#A8B86A", "#4E9B3F", "#145214"))(256))

df_ndvi  <- charger_raster(f_ndvi)
df_ndwi  <- charger_raster(f_ndwi)
df_urban <- charger_raster(f_urban)
df_swir  <- charger_raster(f_swir)

p_ndvi  <- faire_carte(df_ndvi,  pal_ndvi,  "NDVI · Végétation",              "Densité du couvert végétal",  "Indice de végétation",        c("Sol nu", "Mixte", "Végétation"))
p_ndwi  <- faire_carte(df_ndwi,  pal_ndwi,  "NDWI · Eau & Humidité",          "Teneur en eau de surface",    "Indice d'humidité",           c("Faible", "Moyen", "Fort"))
p_urban <- faire_carte(df_urban, pal_urban, "Urban · Imperméabilisation",      "Surfaces artificialisées",    "Indice d'imperméabilisation", c("0", "0,5", "1"))
p_swir  <- faire_carte(df_swir,  pal_swir,  "SWIR · Infrarouge courtes ondes", "Humidité sol & végétation",   "Indice de réflectance",       c("Humide", "Modéré", "Sec"))

# ══════════════════════════════════════════════════════
# 4. AFFICHAGE INDIVIDUEL
# ══════════════════════════════════════════════════════

print(p_ndvi)
print(p_ndwi)
print(p_urban)
print(p_swir)

# ══════════════════════════════════════════════════════
# 5. VUE D'ENSEMBLE
# ══════════════════════════════════════════════════════

p_final <- (p_ndvi + p_ndwi + p_urban + p_swir) +
  plot_layout(ncol = 2) +
  plot_annotation(
    title   = "Indices Sentinel-2 – Marseille · août 2023",
    caption = "Source : Sentinel Hub · Sentinel-2 L2A"
  )

print(p_final)

# ══════════════════════════════════════════════════════
# 6. INDICE D'ÎLOTS DE CHALEUR (UHI)
# ══════════════════════════════════════════════════════

normaliser <- function(r) {
  (r - cellStats(r, min)) / (cellStats(r, max) - cellStats(r, min))
}

r_swir_raw  <- normaliser(crop(raster(f_swir),  BBOX))
r_ndvi_raw  <- normaliser(crop(raster(f_ndvi),  BBOX))
r_ndwi_raw  <- normaliser(crop(raster(f_ndwi),  BBOX))
r_urban_raw <- normaliser(crop(raster(f_urban), BBOX))

r_ndvi_r  <- resample(r_ndvi_raw,  r_swir_raw)
r_ndwi_r  <- resample(r_ndwi_raw,  r_swir_raw)
r_urban_r <- resample(r_urban_raw, r_swir_raw)

r_uhi <- 0.40 * r_swir_raw +
  0.30 * r_ndvi_r   +
  0.10 * r_urban_r  +
  0.10 * r_ndwi_r

r_uhi <- disaggregate(r_uhi, fact = 2, method = "bilinear")
r_uhi[r_uhi < quantile(values(r_uhi), 0.01, na.rm = TRUE)] <- NA
names(r_uhi) <- "uhi"

writeRaster(r_uhi, "marseille_uhi.tif", overwrite = TRUE)

pal_uhi <- colorRampPalette(c("#2C7BB6", "#ABD9E9", "#FFFFBF", "#FDAE61", "#D7191C"))(256)

p_uhi <- as.data.frame(r_uhi, xy = TRUE) |>
  setNames(c("lon", "lat", "val")) |>
  na.omit() |>
  ggplot(aes(x = lon, y = lat, fill = val)) +
  geom_raster(interpolate = TRUE) +
  scale_fill_gradientn(
    colors = pal_uhi, name = "Intensité UHI",
    guide  = guide_colorbar(barwidth = 0.8, barheight = 7, title.position = "top", title.hjust = 0.5)
  ) +
  coord_quickmap(xlim = c(5.25, 5.55), ylim = c(43.20, 43.42), expand = FALSE) +
  labs(
    title    = "Îlots de chaleur urbains · Marseille",
    subtitle = "Indice composite SWIR / NDVI / Urban / NDWI – août 2023",
    caption  = "Source : Sentinel Hub · Sentinel-2 L2A",
    x = NULL, y = NULL
  ) +
  theme(
    text          = element_text(size = 18),
    plot.title    = element_text(size = 22, face = "bold"),
    plot.subtitle = element_text(size = 16),
    legend.title  = element_text(size = 15),
    legend.text   = element_text(size = 13),
    axis.text     = element_text(size = 11)
  )

print(p_uhi)

# ══════════════════════════════════════════════════════
# 7. EXPORT PNG
# ══════════════════════════════════════════════════════

ggsave("marseille_overview.png", plot = p_final, width = 24, height = 16, dpi = 150)
ggsave("marseille_uhi.png",      plot = p_uhi,   width = 12, height = 8,  dpi = 150)