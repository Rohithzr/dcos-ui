import * as React from "react";
import { Trans } from "@lingui/macro";
import { Cell } from "@dcos/ui-kit";
import { Dropdown, Tooltip } from "reactjs-components";
import { Hooks } from "#SRC/js/plugin-bridge/PluginSDK";

import { isSDKService } from "#SRC/js/utils/ServiceUtil";
import Icon from "#SRC/js/components/Icon";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceActionLabels from "../constants/ServiceActionLabels";
import ServiceStatus from "../constants/ServiceStatus";
import ServiceTree from "../structs/ServiceTree";
import {
  DELETE,
  EDIT,
  MORE,
  OPEN,
  RESTART,
  RESUME,
  SCALE,
  STOP
} from "../constants/ServiceActionItem";
import ServicesTable from "/home/georgi/dcos/dcos-ui/plugins/services/src/js/containers/services/ServicesTable";

function hasWebUI(service: Service | Pod | ServiceTree) {
  return (
    service instanceof Service &&
    !isSDKService(service) &&
    service.getWebURL() != null &&
    service.getWebURL() !== ""
  );
}

function onActionsItemSelection(
  service: Service | Pod | ServiceTree,
  actionItem: any
): any {
  const isGroup = service instanceof ServiceTree;
  let containsSDKService = false;

  if (isGroup) {
    containsSDKService =
      // #findItem will flatten the service tree
      service.findItem((item: any) => {
        return item instanceof Service && isSDKService(item);
      }) != null;
  }

  if (
    actionItem.id !== EDIT &&
    actionItem.id !== DELETE &&
    (containsSDKService || isSDKService(service)) &&
    !Hooks.applyFilter(
      "isEnabledSDKAction",
      actionItem.id === EDIT || actionItem.id === OPEN,
      actionItem.id
    )
  ) {
    // ServiceActions.handleActionDisabledModalOpen(service, actionItem.id);
  } else {
    // ServiceActions.handleServiceAction(service, actionItem.id);
  }
}

function renderServiceActionsDropdown(
  service: Service | Pod | ServiceTree,
  actions: any
) {
  return (
    <Dropdown
      anchorRight={true}
      buttonClassName="button button-mini button-link"
      dropdownMenuClassName="dropdown-menu"
      dropdownMenuListClassName="dropdown-menu-list"
      dropdownMenuListItemClassName="clickable"
      wrapperClassName="dropdown flush-bottom table-cell-icon"
      items={actions}
      persistentID={MORE}
      onItemSelection={onActionsItemSelection(service, actions)}
      scrollContainer=".gm-scroll-view"
      scrollContainerParentSelector=".gm-prevented"
      // title="More actions"
      transition={true}
      transitionName="dropdown-menu"
      disabled={service.getServiceStatus() === ServiceStatus.DELETING}
    />
  );
}

export function actionsRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const isGroup = service instanceof ServiceTree;
  const isPod = service instanceof Pod;
  const isSingleInstanceApp = service.getLabels().MARATHON_SINGLE_INSTANCE_APP;
  const instancesCount = service.getInstancesCount();
  const scaleTextID = isGroup
    ? ServiceActionLabels.scale_by
    : ServiceActionLabels[SCALE];
  const isSDK = isSDKService(service);

  const actions = [];

  actions.push({
    className: "hidden",
    id: MORE,
    html: "",
    selectedHtml: <Icon id="ellipsis-vertical" size="mini" />
  });

  if (hasWebUI(service)) {
    actions.push({
      id: OPEN,
      html: <Trans render="span" id={ServiceActionLabels.open} />
    });
  }

  if (!isGroup) {
    actions.push({
      id: EDIT,
      html: <Trans render="span" id={ServiceActionLabels.edit} />
    });
  }

  // isSingleInstanceApp = Framework main scheduler
  // instancesCount = service instances
  if ((isGroup && instancesCount > 0) || (!isGroup && !isSingleInstanceApp)) {
    actions.push({
      id: SCALE,
      html: <Trans render="span" id={scaleTextID} />
    });
  }

  if (!isPod && !isGroup && instancesCount > 0 && !isSDK) {
    actions.push({
      id: RESTART,
      html: <Trans render="span" id={ServiceActionLabels[RESTART]} />
    });
  }

  if (instancesCount > 0 && !isSDK) {
    actions.push({
      id: STOP,
      html: <Trans render="span" id={ServiceActionLabels[STOP]} />
    });
  }

  if (!isGroup && instancesCount === 0 && !isSDK) {
    actions.push({
      id: RESUME,
      html: <Trans render="span" id={ServiceActionLabels[RESUME]} />
    });
  }

  actions.push({
    id: DELETE,
    html: (
      <Trans
        render="span"
        className="text-danger"
        id={ServiceActionLabels[DELETE]}
      />
    )
  });

  if (service.getServiceStatus() === ServiceStatus.DELETING) {
    return renderServiceActionsDropdown(service, actions);
  }

  return (
    <Cell>
      <Tooltip content={<Trans render="span">More actions</Trans>}>
        {renderServiceActionsDropdown(service, actions)}
      </Tooltip>
    </Cell>
  );
}
