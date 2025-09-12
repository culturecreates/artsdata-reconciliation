export const PROPOSED_EXTEND_PROPERTIES_METADATA = {
  EVENT: {
    type: "Event" ,
    properties: [
      { id: "name" , name: "name" } ,
      { id: "startDate" , name: "startDate" } ,
      { id: "endDate" , name: "endDate" } ,
      { id: "disambiguatingDescription" , name: "disambiguatingDescription" } ,
      { id: "additionalType" , name: "additionalType" } ,
      { id: "url" , name: "url" } ,
      { id: "sameAs" , name: "sameAs" } ,
      { id: "eventStatus" , name: "eventStatus" } ,
      { id: "eventAttendanceMode" , name: "eventAttendanceMode" } ,
      { id: "location" , name: "location" } ,
      { id: "offers" , name: "offers" , expandable: true } ,
      { id: "performer" , name: "performer" , expandable: true } ,
      { id: "organizer" , name: "organizer" , expandable: true }
    ]
  } ,
  PLACE: {
    type: "Place" ,
    properties: [
      { id: "name" , name: "name" } ,
      { id: "url" , name: "url" } ,
      { id: "sameAs" , name: "sameAs" } ,
      { id: "disambiguatingDescription" , name: "disambiguatingDescription" } ,
      { id: "address" , name: "address" , expandable: true }
    ]
  } ,
  PERSON: {
    type: "Person" ,
    properties: [
      { id: "name" , name: "name" } ,
      { id: "url" , name: "url" } ,
      { id: "sameAs" , name: "sameAs" } ,
      { id: "disambiguatingDescription" , name: "disambiguatingDescription" }
    ]
  } ,
  ORGANIZATION: {
    type: "Organization" ,
    properties: [
      { id: "name" , name: "name" } ,
      { id: "url" , name: "url" } ,
      { id: "sameAs" , name: "sameAs" } ,
      { id: "disambiguatingDescription" , name: "disambiguatingDescription" }
    ]
  } ,
  AGENT: {
    type: "Agent" ,
    properties: [
      { id: "name" , name: "name" } ,
      { id: "url" , name: "url" } ,
      { id: "sameAs" , name: "sameAs" } ,
      { id: "disambiguatingDescription" , name: "disambiguatingDescription" }
    ]
  }
};