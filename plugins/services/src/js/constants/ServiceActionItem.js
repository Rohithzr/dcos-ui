import UserActions from "#SRC/js/constants/UserActions";

const ServiceActionItem = {
  CREATE: "create",
  CREATE_GROUP: "create_group",
  EDIT: "edit",
  DELETE: UserActions.DELETE,
  RESTART: "restart",
  RESUME: "resume",
  SCALE: "scale",
  SUSPEND: "suspend",
  MORE: "more",
  KILL_POD_INSTANCES: "kill_pod_instances",
  KILL_TASKS: "kill_tasks"
};

module.exports = ServiceActionItem;
