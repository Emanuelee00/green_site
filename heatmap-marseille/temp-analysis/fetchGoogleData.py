import ee

ee.Initialize(project='ter-heatmap')

zones = {
    'centre_ville':    ee.Geometry.Point([5.3698, 43.2965]),
    'nord_urbain':     ee.Geometry.Point([5.3706, 43.3317]),
    'sud_urbain':      ee.Geometry.Point([5.3800, 43.2700]),
    'periurbain_est':  ee.Geometry.Point([5.4800, 43.2965]),
    'periurbain_nord': ee.Geometry.Point([5.3500, 43.3800]),
    'rural_est':       ee.Geometry.Point([5.5500, 43.3000]),
    'rural_nord':      ee.Geometry.Point([5.3000, 43.4500]),
    'rural_ouest':     ee.Geometry.Point([5.1500, 43.3000]),
    'rural_sud':       ee.Geometry.Point([5.3500, 43.1500]),
}

modis = ee.ImageCollection('MODIS/061/MOD11A1') \
    .filterDate('2000-01-01', '2024-12-31') \
    .select(['LST_Day_1km', 'LST_Night_1km'])

def extract_modis(zone_name, point):
    def extract(image):
        stats = image.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=point.buffer(5000),
            scale=1000,
            bestEffort=True
        )

        day_raw   = stats.get('LST_Day_1km')
        night_raw = stats.get('LST_Night_1km')

        # Valeurs par défaut si null
        day_safe   = ee.Number(ee.Algorithms.If(day_raw,   day_raw,   -9999))
        night_safe = ee.Number(ee.Algorithms.If(night_raw, night_raw, -9999))

        day_C   = ee.Number(ee.Algorithms.If(
            day_raw,
            ee.Number(day_raw).multiply(0.02).subtract(273.15),
            -9999
        ))
        night_C = ee.Number(ee.Algorithms.If(
            night_raw,
            ee.Number(night_raw).multiply(0.02).subtract(273.15),
            -9999
        ))
        amplitude = ee.Number(ee.Algorithms.If(
            ee.Number(day_C).gt(-9999).And(ee.Number(night_C).gt(-9999)),
            day_C.subtract(night_C),
            -9999
        ))

        return ee.Feature(None, {
            'source':      'MODIS_LST',
            'zone':        zone_name,
            'date':        image.date().format('YYYY-MM-dd'),
            'annee':       image.date().get('year'),
            'mois':        image.date().get('month'),
            'jour':        image.date().get('day'),
            'LST_jour_C':  day_C,
            'LST_nuit_C':  night_C,
            'amplitude_C': amplitude,
        })

    return extract

print("Construction des FeatureCollections MODIS...")
modis_features = ee.FeatureCollection([])

for zone_name, point in zones.items():
    print(f"  → Zone : {zone_name}")
    fc = ee.FeatureCollection(modis.map(extract_modis(zone_name, point)))
    modis_features = modis_features.merge(fc)

task = ee.batch.Export.table.toDrive(
    collection=modis_features,
    description='MODIS_LST_marseille_2000_2024',
    fileFormat='CSV',
    folder='EarthEngine_Marseille',
    fileNamePrefix='MODIS_marseille_2000_2024'
)
task.start()
print(f"\nMODIS export lancé → statut : {task.status()['state']}")
print("Surveille : https://code.earthengine.google.com/tasks")
