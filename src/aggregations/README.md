# Convention

## Aggregations

- Each aggregation should be named after a `model` it derived from except for specialized aggegations
- Each aggregation should expose it base
- Each base aggregation should support initial criteria
- All aggregations are runned against data seeds available in `test/fixtures`

## Fields

- All extra metric fields should be added into `metrics` object to avoid collision with other aggregation fields
- All extra time fields should be in their singular form e.g `active`
- All extra time fields should be suffixed with `Time` e.g `activeTime`

## Structures

### Overview Analysis

```js
{
  data: {
    parties: {
      focal: Number,
      agency: Number,
      level: Number,
      area: Number,
      group: Number,
      role: Number,
      active: Number,
      inactive: Number
    }
  }
}
```

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
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      agency: Number,
      focal: Number
    }],
    areas: [{
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      agency: Number,
      focal: Number
    }],
    groups: [{
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      agency: Number,
      focal: Number
    }],
    roles: [{
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      agency: Number,
      focal: Number
    }]
  }
}
```

### Event Analysis

```js
{
  overview: {
    total: Number,
    alert: Number,
    event: Number,
    active: Number,
    ended: Number
  },
  overall: {
    groups: [{
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      total: Number,
      alert: Number,
      event: Number,
      active: Number,
      ended: Number
    }],
    types: [{
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      total: Number,
      alert: Number,
      event: Number,
      active: Number,
      ended: Number
    }],
    levels: [{
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      total: Number,
      alert: Number,
      event: Number,
      active: Number,
      ended: Number
    }],
    severities: [{
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      total: Number,
      alert: Number,
      event: Number,
      active: Number,
      ended: Number
    }],
    certainties: [{
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      total: Number,
      alert: Number,
      event: Number,
      active: Number,
      ended: Number
    }],
    statuses: [{
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      total: Number,
      alert: Number,
      event: Number,
      active: Number,
      ended: Number
    }],
    urgencies: [{
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      total: Number,
      alert: Number,
      event: Number,
      active: Number,
      ended: Number
    }],
    responses: [{
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      total: Number,
      alert: Number,
      event: Number,
      active: Number,
      ended: Number
    }],
    areas: [{
      _id: ObjectId,
      name: { en: String },
      color: String,
      weight: Number,
      total: Number,
      alert: Number,
      event: Number,
      active: Number,
      ended: Number
    }]
  }
}
```
