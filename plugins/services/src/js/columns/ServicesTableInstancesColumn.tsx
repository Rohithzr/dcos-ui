import * as React from "react";
import { Trans } from "@lingui/macro";
import { TextCell } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";
import sort from "array-sort";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import EmptyStates from "#SRC/js/constants/EmptyStates";
import StringUtil from "#SRC/js/utils/StringUtil";

export function instancesRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const instancesCount = service.getInstancesCount();
  const runningInstances = service.getRunningInstancesCount();
  const overview =
    runningInstances === instancesCount
      ? ` ${runningInstances}`
      : ` ${runningInstances}/${instancesCount}`;

  const content = !Number.isInteger(instancesCount)
    ? EmptyStates.CONFIG_VALUE
    : overview;

  // L10NTODO: Pluralize
  const tooltipContent = (
    <Trans render="span">
      {runningInstances} {StringUtil.pluralize("instance", runningInstances)}{" "}
      running out of {instancesCount}
    </Trans>
  );

  return (
    <TextCell>
      <Tooltip content={tooltipContent}>
        <span>{content}</span>
      </Tooltip>
    </TextCell>
  );
}

function compareServicesByRunningInstances(a: any, b: any): number {
  const runningInstancesA = a.getRunningInstancesCount();
  const runningInstancesB = b.getRunningInstancesCount();

  return runningInstancesA - runningInstancesB;
}

const comparators = [compareServicesByRunningInstances];
export function instancesSorter(data: any, sortDirection: any): any {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}
