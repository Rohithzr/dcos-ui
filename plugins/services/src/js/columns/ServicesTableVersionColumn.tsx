import * as React from "react";
import { TextCell } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";
import sort from "array-sort";

import ServiceTableUtil from "../utils/ServiceTableUtil";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

export function versionRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const version = ServiceTableUtil.getFormattedVersion(service);
  if (!version) {
    return null;
  }

  return (
    <TextCell>
      <Tooltip
        content={version.rawVersion}
        wrapperClassName="tooltip-wrapper tooltip-block-wrapper text-overflow"
        wrapText={true}
      >
        {version.displayVersion}
      </Tooltip>
    </TextCell>
  );
}

function compareServicesByVersion(a: any, b: any): number {
  const displayVersionA: string =
    ServiceTableUtil.getFormattedVersion(a).displayVersion || "";
  const displayVersionB: string =
    ServiceTableUtil.getFormattedVersion(b).displayVersion || "";

  return displayVersionA
    .toLowerCase()
    .localeCompare(displayVersionB.toLowerCase());
}

const comparators = [compareServicesByVersion];
export function versionSorter(data: any, sortDirection: any): any {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}
