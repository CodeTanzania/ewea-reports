const features = [
  {
    namespace: 'Feature',
    strings: { name: { en: 'Amana Hospital' } },
    populate: {
      'relations.type': {
        match: {
          namespace: 'FeatureType',
          'strings.name.en': 'Hospital',
        },
        model: 'Predefine',
      },
    },
  },
  {
    namespace: 'Feature',
    strings: { name: { en: 'Muhimbili Hospital' } },
    populate: {
      'relations.type': {
        match: {
          namespace: 'FeatureType',
          'strings.name.en': 'Hospital',
        },
        model: 'Predefine',
      },
    },
  },
];

export default features;
