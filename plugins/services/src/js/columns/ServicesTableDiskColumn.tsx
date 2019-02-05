import * as React from "react";
import { TextCell } from "@dcos/ui-kit";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import Units from "#SRC/js/utils/Units";

export function diskRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const resource = service.getResources()[`disk`];

  return (
    <TextCell>
      <span>{Units.formatResource("disk", resource)}</span>
    </TextCell>
  );
}
