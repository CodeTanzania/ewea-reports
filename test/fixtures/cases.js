const cases = [
  {
    _id: '5eb20aaadcf2bd6aae15b4d0',
    number: '2020-O5-0001-TZ',
    victim: {
      referral: '85623679',
      pcr: '95623679',
      name: 'Jane Mode',
      mobile: '255714117841',
      age: 30,
      weight: 51,
      address: 'Tandale',
      nextOfKin: { name: 'Asha Mdoe', mobile: '255714104893' },
    },
    description: 'Severe injury from Floods.',
    reportedAt: '2020-05-04T02:48:48.323Z',
    createdAt: '2020-05-04T02:48:48.323Z',
    dischargedAt: '2020-05-04T02:59:48.323Z',
    remarks: 'Handled.',
    populate: {
      reporter: {
        match: { name: 'Ali Mdoe' },
        model: 'Party',
      },
      discharger: {
        match: { name: 'Ali Mdoe' },
        model: 'Party',
      },
      'victim.gender': {
        match: { namespace: 'PartyGender', 'strings.name.en': 'Female' },
        model: 'Predefine',
      },
      'victim.occupation': {
        match: {
          namespace: 'PartyOccupation',
          'strings.name.en': 'Health Care Worker',
        },
        model: 'Predefine',
      },
      'victim.area': {
        match: { namespace: 'AdministrativeArea', 'strings.name.en': 'Ilala' },
        model: 'Predefine',
      },
    },
  },
  {
    _id: '5ed6067457b8430017a4e390',
    number: '2020-O6-0002-TZ',
    victim: {
      referral: '85623689',
      pcr: '95623689',
      name: 'John Mussa',
      mobile: '255714127841',
      age: 50,
      weight: 71,
      address: 'Sinza',
      nextOfKin: { name: 'Asha Mussa', mobile: '255710104893' },
    },
    description: 'Severe injury from Floods.',
    reportedAt: '2020-05-04T02:48:48.323Z',
    createdAt: '2020-05-04T02:48:48.323Z',
    dischargedAt: '2020-05-04T02:59:48.323Z',
    remarks: 'Handled.',
    populate: {
      reporter: {
        match: { name: 'Ali Mdoe' },
        model: 'Party',
      },
      discharger: {
        match: { name: 'Ali Mdoe' },
        model: 'Party',
      },
      'victim.gender': {
        match: { namespace: 'PartyGender', 'strings.name.en': 'Male' },
        model: 'Predefine',
      },
      'victim.occupation': {
        match: {
          namespace: 'PartyOccupation',
          'strings.name.en': 'Civil Engineer',
        },
        model: 'Predefine',
      },
      'victim.area': {
        match: { namespace: 'AdministrativeArea', 'strings.name.en': 'Temeke' },
        model: 'Predefine',
      },
    },
  },
];

export default cases;
