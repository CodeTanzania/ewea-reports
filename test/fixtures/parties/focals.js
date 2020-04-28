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
          'strings.name.en': 'Unknown',
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
      role: {
        match: {
          namespace: 'PartyRole',
          'strings.name.en': 'Administrator',
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
          'strings.name.en': 'Unknown',
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
      role: {
        match: {
          namespace: 'PartyRole',
          'strings.name.en': 'Administrator',
        },
        model: 'Predefine',
      },
    },
  },
  {
    type: 'Focal',
    name: 'Nancy Victor',
    abbreviation: 'NV',
    locale: 'en',
    email: 'navish45@example.com',
    mobile: '255782120002',
    password: '$2a$10$rwpL/BhU8xY4fkf8SG7fHugF4PCioTJqy8BLU7BZ8N0YV.8Y1dXem',
    confirmedAt: '2018-12-01T11:22:37.185+00:00',
    populate: {
      group: {
        match: {
          namespace: 'PartyGroup',
          'strings.name.en': 'Unknown',
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
      role: {
        match: {
          namespace: 'PartyRole',
          'strings.name.en': 'Administrator',
        },
        model: 'Predefine',
      },
    },
  },
  {
    type: 'Focal',
    name: 'Edgar Vitus Mlowe',
    abbreviation: 'EVM',
    locale: 'en',
    email: 'mloweedgarvitus@example.com',
    mobile: '255654988007',
    password: '$2a$10$rwpL/BhU8xY4fkf8SG7fHugF4PCioTJqy8BLU7BZ8N0YV.8Y1dXem',
    confirmedAt: '2018-12-01T11:22:37.185+00:00',
    populate: {
      group: {
        match: {
          namespace: 'PartyGroup',
          'strings.name.en': 'Unknown',
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
      role: {
        match: {
          namespace: 'PartyRole',
          'strings.name.en': 'Administrator',
        },
        model: 'Predefine',
      },
    },
  },
  {
    type: 'Focal',
    name: 'Beatrice Charles',
    abbreviation: 'BC',
    locale: 'en',
    email: 'charsbeaty@example.com',
    mobile: '255687902003',
    password: '$2a$10$rwpL/BhU8xY4fkf8SG7fHugF4PCioTJqy8BLU7BZ8N0YV.8Y1dXem',
    confirmedAt: '2018-12-01T11:22:37.185+00:00',
    populate: {
      group: {
        match: {
          namespace: 'PartyGroup',
          'strings.name.en': 'Unknown',
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
      role: {
        match: {
          namespace: 'PartyRole',
          'strings.name.en': 'Administrator',
        },
        model: 'Predefine',
      },
    },
  },
  {
    type: 'Focal',
    name: 'Richard Aggrey',
    abbreviation: 'RA',
    locale: 'en',
    email: 'richardaggrey7@example.com',
    mobile: '255658040007',
    password: '$2a$10$rwpL/BhU8xY4fkf8SG7fHugF4PCioTJqy8BLU7BZ8N0YV.8Y1dXem',
    confirmedAt: '2018-12-01T11:22:37.185+00:00',
    populate: {
      group: {
        match: {
          namespace: 'PartyGroup',
          'strings.name.en': 'Unknown',
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
