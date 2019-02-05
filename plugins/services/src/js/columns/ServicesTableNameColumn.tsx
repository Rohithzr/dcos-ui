import * as React from "react";
import { TextCell } from "@dcos/ui-kit";
import { Link } from "react-router";

import Icon from "#SRC/js/components/Icon";
import ServiceTree from "../structs/ServiceTree";
import Service from "../structs/Service";
import { isSDKService } from "#SRC/js/utils/ServiceUtil";
import Pod from "../structs/Pod";

export function nameRenderer(
  service: Service | Pod | ServiceTree
): React.ReactNode {
  const id: number = encodeURIComponent(service.getId());
  const isGroup = service instanceof ServiceTree;
  const serviceLink = isGroup
    ? `/services/overview/${id}`
    : `/services/detail/${id}`;

  return (
    <TextCell>
      <div className="service-table-heading flex-box flex-box-align-vertical-center table-cell-flex-box">
        <Link className="table-cell-icon" to={serviceLink}>
          {getImage(service)}
        </Link>
        <span className="table-cell-value table-cell-flex-box">
          {getServiceLink(service)}
          {getOpenInNewWindowLink(service)}
        </span>
      </div>
    </TextCell>
  );
}

function getImage(service: any): any {
  if (service instanceof ServiceTree) {
    // Get serviceTree image/icon
    return (
      <Icon
        className="icon-margin-right"
        color="grey"
        id="folder"
        size="mini"
      />
    );
  }

  // Get service image/icon
  return (
    <span className="icon icon-mini icon-image-container icon-app-container icon-margin-right">
      <img src={service.getImages()["icon-small"]} />
    </span>
  );
}

function getServiceLink(service: any): any {
  const id = encodeURIComponent(service.getId());
  const isGroup = service instanceof ServiceTree;
  const serviceLink = isGroup
    ? `/services/overview/${id}`
    : `/services/detail/${id}`;

  // if (this.props.isFiltered) {
  //   return (
  //     <NestedServiceLinks
  //       serviceLink={serviceLink}
  //       serviceID={id}
  //       className="service-breadcrumb"
  //       majorLinkClassName="service-breadcrumb-service-id"
  //       minorLinkWrapperClassName="service-breadcrumb-crumb"
  //     />
  //   );
  // }

  return (
    <Link className="table-cell-link-primary text-overflow" to={serviceLink}>
      {service.getName()}
    </Link>
  );
}

function getOpenInNewWindowLink(service: any): any {
  // This might be a serviceTree and therefore we need this check
  // And getWebURL might therefore not be available
  if (!hasWebUI(service)) {
    return null;
  }

  return (
    <a
      className="table-cell-icon table-display-on-row-hover"
      href={service.getWebURL()}
      target="_blank"
      title="Open in a new window"
    >
      <Icon
        color="neutral"
        className="icon-margin-left"
        id="open-external"
        size="mini"
      />
    </a>
  );
}

function hasWebUI(service: any): any {
  return (
    service instanceof Service &&
    !isSDKService(service) &&
    service.getWebURL() != null &&
    service.getWebURL() !== ""
  );
}
