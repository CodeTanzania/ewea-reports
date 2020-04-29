# Convention

## Aggregation
- Each aggregation should be named after a `model` it derived from
- Each aggregation should expose it base
- Each base aggregation should support initial criteria

## Metric Fields
- All extra metric fields should be added into `metric` object to avoid collision with other aggregation fields
- All extra time fields should be suffixed with `Time` e.g `activeTime`
