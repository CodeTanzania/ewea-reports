const vehicles = [
  {
    namespace: 'Vehicle',
    strings: { name: { en: 'T 123 ABC' } },
    populate: {
      'relations.type': {
        match: {
          namespace: 'VehicleType',
          'strings.name.en': 'Ambulance',
        },
        model: 'Predefine',
      },
      'relations.model': {
        match: {
          namespace: 'VehicleModel',
          'strings.name.en': 'Toyota',
        },
        model: 'Predefine',
      },
      'relations.make': {
        match: {
          namespace: 'VehiclMake',
          'strings.name.en': 'Land Cruiser',
        },
        model: 'Predefine',
      },
      'relations.owner': {
        match: {
          'strings.name.en': 'Multi-Agency Emergency Response Team',
        },
        model: 'Party',
      },
      'relations.ownership': {
        match: {
          namespace: 'PartyOwnership',
          'strings.name.en': 'Government',
        },
        model: 'Predefine',
      },
      'relations.status': {
        match: {
          namespace: 'VehicleStatus',
          'strings.name.en': 'Idle',
        },
        model: 'Predefine',
      },
      'relations.level': {
        match: {
          namespace: 'AdministrativeLevel',
          'strings.name.en': 'District',
        },
        model: 'Predefine',
      },
      'relations.area': {
        match: {
          namespace: 'AdministrativeArea',
          'strings.name.en': 'Ilala',
        },
        model: 'Predefine',
      },
      'relations.facility': {
        match: {
          namespace: 'Feature',
          'strings.name.en': 'Amana Hospital',
        },
        model: 'Predefine',
      },
    },
  },
];

export default vehicles;
