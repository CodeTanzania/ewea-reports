# Convention

## Aggregations
- Each aggregation should be named after a `model` it derived from
- Each aggregation should expose it base
- Each base aggregation should support initial criteria
- All aggregations are runned against data seeds available in `test/fixtures`

## Fields
- All extra metric fields should be added into `metrics` object to avoid collision with other aggregation fields
- All extra time fields should be in their singular form e.g `active`
- All extra time fields should be suffixed with `Time` e.g `activeTime`

## Structures

### Party Analysis
```js
{
  overview: {
    focal: Number,
    agency: Number,
    level: Number,
    area: Number,
    group: Number,
    role: Number,
    active: Number,
    inactive: Number
  },
  overall: {
    levels: [{ 
      level: { name: { en: String }, color: String, weight: Number }, 
      agency: Number, 
      focal: Number 
    }],
    groups: [{ 
      group: { name: { en: String }, color: String, weight: Number }, 
      agency: Number, 
      focal: Number 
    }],
    roles: [{ 
      role: { name: { en: String }, color: String, weight: Number }, 
      agency: Number, 
      focal: Number 
    }]
  }
}
```
