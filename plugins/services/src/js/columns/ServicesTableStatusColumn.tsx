import * as React from "react";
import { Trans } from "@lingui/macro";
import { TextCell } from "@dcos/ui-kit";
import sort from "array-sort";

import StringUtil from "#SRC/js/utils/StringUtil";
import ServiceStatusIcon from "../components/ServiceStatusIcon";
import ServiceStatus from "../constants/ServiceStatus";
import ServiceStatusProgressBar from "../components/ServiceStatusProgressBar";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

const StatusMapping: any = {
  Running: "running-state"
};

export function statusRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const serviceStatusText: string = service.getStatus();
  const serviceStatusClassSet: string = StatusMapping[serviceStatusText] || "";
  const instancesCount: number = service.getInstancesCount();
  const runningInstances: number = service.getRunningInstancesCount();

  // L10NTODO: Pluralize
  const tooltipContent = (
    <Trans render="span">
      {runningInstances} {StringUtil.pluralize("instance", runningInstances)}{" "}
      running out of {instancesCount}
    </Trans>
  );
  const hasStatusText = serviceStatusText !== ServiceStatus.NA.displayName;

  return (
    <TextCell>
      <div className="flex">
        <div className={`${serviceStatusClassSet} service-status-icon-wrapper`}>
          <ServiceStatusIcon
            service={service}
            showTooltip={true}
            tooltipContent={tooltipContent}
          />
          {hasStatusText && (
            <Trans
              id={serviceStatusText}
              render="span"
              className="status-bar-text"
            />
          )}
        </div>
        <div className="service-status-progressbar-wrapper">
          <ServiceStatusProgressBar service={service} />
        </div>
      </div>
    </TextCell>
  );
}

function compareServicesByStatus(a: any, b: any): number {
  return a
    .getStatus()
    .toLowerCase()
    .localeCompare(b.getStatus().toLowerCase());
}

const comparators = [compareServicesByStatus];
export function statusSorter(data: any, sortDirection: any): any {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}
