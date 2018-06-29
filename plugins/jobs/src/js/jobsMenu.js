import StringUtil from "#SRC/js/utils/StringUtil";
import UserActions from "#SRC/js/constants/UserActions";

import jobsRunNow from "./jobsRunNow";
import jobsToggleSchedule from "./jobsToggleSchedule";

function jobsEdit(editAction) {
  return {
    label: "Edit",
    onItemSelect: editAction
  };
}

// TODO - use delete mediator https://jira.mesosphere.com/browse/DCOS-38492
//      - implement onItemSelect
//      - add jobsDelete-test.js
function jobsDelete(deleteHandler) {
  return {
    className: "text-danger",
    label: StringUtil.capitalize(UserActions.DELETE),
    onItemSelect: deleteHandler
  };
}

function optionalJobsScheduleMenu(job) {
  if (job.schedules.length === 0) {
    return null;
  }

  return jobsToggleSchedule(job);
}

export default function jobsMenu(job, customActionHandlers) {
  if (!job) {
    return [];
  }

  return [
    jobsEdit(customActionHandlers.edit),
    jobsRunNow(job.getId()),
    optionalJobsScheduleMenu(job),
    jobsDelete(customActionHandlers.delete),
  ].filter(menuItem => menuItem !== null);
}