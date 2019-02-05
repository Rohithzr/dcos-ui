import ServiceStatusTypes from "./ServiceStatusTypes";
import ServiceStatusLabels from "./ServiceStatusLabels";

export var RUNNING: {
  key: ServiceStatusTypes.RUNNING,
  displayName: ServiceStatusLabels.RUNNING
}
export var DEPLOYING: {
  key: ServiceStatusTypes.DEPLOYING,
  displayName: ServiceStatusLabels.DEPLOYING
}
export var STOPPED: {
  key: ServiceStatusTypes.STOPPED,
  displayName: ServiceStatusLabels.STOPPED
}
export var NA: {
  key: ServiceStatusTypes.NA,
  displayName: ServiceStatusLabels.NA
}
export var DELAYED: {
  key: ServiceStatusTypes.DELAYED,
  displayName: ServiceStatusLabels.DELAYED
}
export var WAITING: {
  key: ServiceStatusTypes.WAITING,
  displayName: ServiceStatusLabels.WAITING
}
export var DELETING: {
  key: ServiceStatusTypes.DELETING,
  displayName: ServiceStatusLabels.DELETING
}
export var RECOVERING: {
  key: ServiceStatusTypes.RECOVERING,
  displayName: ServiceStatusLabels.RECOVERING
}