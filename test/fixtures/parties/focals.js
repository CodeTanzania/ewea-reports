const focals = [
  {
    type: 'Focal',
    name: 'Lally Elias',
    abbreviation: 'LE',
    locale: 'en',
    email: 'lallyelias87@example.com',
    mobile: '255714095001',
    password: '$2a$10$rwpL/BhU8xY4fkf8SG7fHugF4PCioTJqy8BLU7BZ8N0YV.8Y1dXem',
    confirmedAt: '2018-12-01T11:22:37.185+00:00',
    populate: {
      group: {
        match: {
          namespace: 'PartyGroup',
          'strings.name.en': 'Hospitals',
        },
        model: 'Predefine',
      },
      area: {
        match: {
          namespace: 'AdministrativeArea',
          'strings.name.en': 'Ilala',
        },
        model: 'Predefine',
      },
      level: {
        match: {
          namespace: 'AdministrativeLevel',
          'strings.name.en': 'District',
        },
        model: 'Predefine',
      },
      role: {
        match: {
          namespace: 'PartyRole',
          'strings.name.en': 'Coordinator',
        },
        model: 'Predefine',
      },
    },
  },
  {
    type: 'Focal',
    name: 'Benson Maruchu',
    abbreviation: 'BM',
    locale: 'en',
    email: 'benmaruchu@example.com',
    mobile: '255719818009',
    password: '$2a$10$rwpL/BhU8xY4fkf8SG7fHugF4PCioTJqy8BLU7BZ8N0YV.8Y1dXem',
    confirmedAt: '2018-12-01T11:22:37.185+00:00',
    populate: {
      group: {
        match: {
          namespace: 'PartyGroup',
          'strings.name.en': 'Ambulance Services',
        },
        model: 'Predefine',
      },
      area: {
        match: {
          namespace: 'AdministrativeArea',
          'strings.name.en': 'Ilala',
        },
        model: 'Predefine',
      },
      level: {
        match: {
          namespace: 'AdministrativeLevel',
          'strings.name.en': 'District',
        },
        model: 'Predefine',
      },
      role: {
        match: {
          namespace: 'PartyRole',
          'strings.name.en': 'Administrator',
        },
        model: 'Predefine',
      },
    },
  },
];

export default focals;
