import units from './units';
import priorities from './priorities';
import administrativeLevels from './administrativelevels';
import featureTypes from './featuretypes';
import eventIndicators from './eventindicators';
import eventTopics from './eventtopics';
import eventLevels from './eventlevels';
import eventSeverities from './eventseverities';
import eventCertainties from './eventcertainties';
import eventStatuses from './eventstatuses';
import eventUrgencies from './eventurgencies';
import eventResponses from './eventresponses';
import partyOwnerships from './partyownerships';
import partyGroups from './partygroups';
import partyRoles from './partyroles';
import partyGenders from './partygenders';
import partyOccupations from './partyoccupations';
import partyNationalities from './partynationalities';
import vehicleTypes from './vehicletypes';
import vehicleModels from './vehiclemodels';
import vehicleMakes from './vehiclemakes';
import vehicleStatuses from './vehiclestatuses';
import eventGroups from './eventgroups';
import eventTypes from './eventtypes';
import eventFunctions from './eventfunctions';
import eventActions from './eventactions';
import eventQuestions from './eventquestions';
import administrativeAreas from './administrativeareas';
import features from './features';
import vehicles from './vehicles';
import eventActionCatalogues from './eventactioncatalogues';

const predefines = [
  ...units,
  ...priorities,
  ...administrativeLevels,
  ...featureTypes,
  ...eventIndicators,
  ...eventTopics,
  ...eventLevels,
  ...eventSeverities,
  ...eventCertainties,
  ...eventStatuses,
  ...eventUrgencies,
  ...eventResponses,
  ...partyOwnerships,
  ...partyGroups,
  ...partyRoles,
  ...partyGenders,
  ...partyOccupations,
  ...partyNationalities,
  ...vehicleTypes,
  ...vehicleModels,
  ...vehicleMakes,
  ...vehicleStatuses,
  ...eventGroups,
  ...eventTypes,
  ...eventFunctions,
  ...eventActions,
  ...eventQuestions,
  ...administrativeAreas,
  ...features,
  ...vehicles,
  ...eventActionCatalogues,
  // ...notificationTemplates,
];

export default predefines;
