import * as React from "react";
import { TextCell } from "@dcos/ui-kit";
import sort from "array-sort";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import Units from "#SRC/js/utils/Units";

export function memRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const resource = service.getResources()[`mem`];

  return (
    <TextCell>
      <span>{Units.formatResource("mem", resource)}</span>
    </TextCell>
  );
}

function compareServicesByMemUsage(a: any, b: any): number {
  return a.getResources()[`mem`] - b.getResources()[`mem`];
}

const comparators = [compareServicesByMemUsage];
export function memSorter(data: any, sortDirection: any): any {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}
