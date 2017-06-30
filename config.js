var defaultVal = {
  //"rtcURL": {type: 'rtc', label: "Your Project's RTC base URL",  value: 'https://swgjazz.ibm.com:8017'},
  


  "attURL" : {type: 'rtc', label: "Agile team tool URL",  value: 'https://agiletool.mybluemix.net'},

  "attAPIKEY" : {type: 'rtc', label: "ATT API KEY",  value: ''},

  "servicePathC" : {type: 'rtc', label: "RTC's Base URL path (How RTC gets the data using XHR request) (dont touch this)",  value: ''},
  "getResultURL" : {type: 'rtc', label: "RTC's Query Result Service (for a RTC query) (dont touch this)",  value: 'com.ibm.team.workitem.common.internal.rest.IQueryRestService/getResultSet'},
  "getHistoryURL" : {type: 'rtc', label: "RTC's Get History Service (for a workitem) (dont touch this)",  value: "com.ibm.team.workitem.common.internal.rest.IWorkItemRestService/workItemDTO2?id={itemId}&includeAttributes=true&includeLinks=true&includeApprovals=false&includeHistory=true&includeLinkHistory=true"},
  "getLinksURL" : {type: 'rtc', label: "RTC's Get Links Service (for a workitem) (dont touch this)",  value: "com.ibm.team.workitem.common.internal.rest.IWorkItemRestService/workItemDTO2?includeHistory=false&id={itemId}"},
  
  "backlogStartsAt" : {type: 'backlog', label: "Pattern to decide when a workitem comes into product Backlog",  value: ['New']},
  
  "backlogStartsAtCreation" : {type: 'backlog', label: "Set true to consider creation date of the story/feature as backlog approved date (If it couldnt find above pattern)",  value: 'true'},

  "backlogEndsAt" : {type: 'backlog', label: "Pattern to decide when a story start to implementing",  value: ['In Development']},

  "backlogWithStory" : {type: 'backlog', label: "Set true to consider stories also for calculating backlog (if no parent feature exists)",  value: 'both'},
  
  "ConsiderSameSquad" : {type: 'backlog', label: "Set true to consider stories and parent in same squad field (Set false if you don't have 'File-against' attribute in RTC)",  value: 'true'},

  "backlogParentType" : {type: 'backlog', label: "Pattern to decide workitem types consider as parent",  value: ['Story', 'Feature', 'Program Epic']},
  
  "workStartsAt" : {type: 'wip', label: "Pattern to decide when the work starts",  value: [
    'In Progress',
    'Implementing',
    'In Development'
  ]},

  "workEndsAt": {type: 'wip', label: "Pattern to decide when the work ends",  value: ['Done']},

  "defectsClosed": {type: 'defect', label: "Pattern to decide when the defect is closed", value: ['Resolved', 'Verified']},
  "defectsEnvVar": {type: 'defect', label: "key (in the RTC workitem) to decide the environment (set empty value if you dont have environment)", value: 'environment'},
  "defectsEnv": {type: 'defect', label: "Defect environment to be considered (not used when environment has empty value)", value: ['Production']},

  "historyArrowSym": {type: 'rtc', label: "How arrow symbol designed in your RTC (dont touch this)",  value: '&nbsp;&nbsp;&rarr;&nbsp;&nbsp;'}


}


var $sprintData = {

    'defects' : 0, //defects
    'defectsClosed' : 0, //defectsClosed
    'commStories' : 0,//commStories
    'commStoriesDel' : 0,//commStoriesDel
    'commPoints' : 0, //commPoints
    'commPointsDel' : 0, //commPointsDel
    'WIPTotal' : 0,
    'cycleTimeWIP' : 0, //cycleTimeWIP
    'BLTotal' : 0,
    'cycleTimeInBacklog' : 0, //cycleTimeInBacklog
    'clientSatisfaction' : 4,
    'teamSatisfaction' : 4,

};

var $sprintDataLabel = {

    'defects' : 'New this iteration:', //defects
    'defectsClosed' : 'Resolved this iteration:', //defectsClosed
    'commStories' : 'Stories/Cards/Tickets-Committed:',//commStories
    'commStoriesDel' : 'Stories/Cards/Tickets-Delivered:',//commStoriesDel
    'commPoints' : 'Story points - Committed:', //commPoints
    'commPointsDel' : 'Story points delivered:', //commPointsDel
    'WIPTotal' : 'Work in progress - Total',
    'cycleTimeWIP' : 'Cycle time in WIP (days):', //cycleTimeWIP
    'BLTotal' : 'Total backlog (days)',
    'BLLength' : 'Stories for Cycle time in Backlog',
    'cycleTimeInBacklog' : 'Cycle time in backlog (days):', //cycleTimeInBacklog
    'clientSatisfaction' : 'Client satisfaction:',
    'teamSatisfaction' : 'Team satisfaction:',
    'commFeatures': 'Features/Stories comitted and delivered'
    

};