import units from './units';
import administrativeLevels from './administrativelevels';
import featureTypes from './featuretypes';
import eventIndicators from './eventindicators';
import eventTopics from './eventtopics';
import eventCertainties from './eventcertainties';
import eventLevels from './eventlevels';
import eventSeverities from './eventseverities';
import eventStatuses from './eventstatuses';
import eventUrgencies from './eventurgencies';
import eventGroups from './eventgroups';
import eventTypes from './eventtypes';
import eventQuestions from './eventquestions';
import partyGroups from './partygroups';
import partyRoles from './partyroles';
import eventFunctions from './eventfunctions';
import eventActions from './eventactions';
import administrativeAreas from './administrativeareas';
import eventActionCatalogues from './eventactioncatalogues';

const predefines = [
  ...units,
  ...administrativeLevels,
  ...featureTypes,
  ...eventIndicators,
  ...eventTopics,
  ...eventLevels,
  ...eventSeverities,
  ...eventCertainties,
  ...eventStatuses,
  ...eventUrgencies,
  ...eventGroups,
  ...eventTypes,
  ...partyGroups,
  ...partyRoles,
  ...eventQuestions,
  ...eventFunctions,
  ...eventActions,
  ...administrativeAreas,
  ...eventActionCatalogues,
];

export default predefines;
