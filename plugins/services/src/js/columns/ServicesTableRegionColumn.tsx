import * as React from "react";
import { TextCell } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";

import CompositeState from "#SRC/js/structs/CompositeState";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

export function regionRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const localRegion: string = CompositeState.getMasterNode().getRegionName();
  let regions: string[] = service.getRegions();

  regions = regions.map(
    region => (region === localRegion ? region + " (Local)" : region)
  );

  if (regions.length === 0) {
    regions.push("N/A");
  }

  return (
    <TextCell>
      <Tooltip
        elementTag="span"
        wrapperClassName="tooltip-wrapper tooltip-block-wrapper text-overflow"
        wrapText={true}
        content={regions.join(", ")}
      >
        {regions.join(", ")}
      </Tooltip>
    </TextCell>
  );
}
