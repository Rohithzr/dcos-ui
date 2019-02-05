import * as React from "react";
import { TextCell } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";

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
