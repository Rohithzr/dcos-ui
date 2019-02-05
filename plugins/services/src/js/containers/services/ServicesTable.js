import * as React from "react";
import { Trans } from "@lingui/macro";
// import classNames from "classnames";
import { Dropdown, /* Table ,*/ Tooltip } from "reactjs-components";
import { Link, routerShape } from "react-router";
import PropTypes from "prop-types";
// import React from "react";
import { Hooks } from "PluginSDK";
import { Table, Column, SortableHeaderCell } from "@dcos/ui-kit/dist/packages";

// import StringUtil from "#SRC/js/utils/StringUtil";
// import EmptyStates from "#SRC/js/constants/EmptyStates";
import Icon from "#SRC/js/components/Icon";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import NestedServiceLinks from "#SRC/js/components/NestedServiceLinks";
// import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
// import TableUtil from "#SRC/js/utils/TableUtil";
// import Units from "#SRC/js/utils/Units";
import { isSDKService } from "#SRC/js/utils/ServiceUtil";
// import CompositeState from "#SRC/js/structs/CompositeState";
// import ServiceStatusProgressBar from "../../components/ServiceStatusProgressBar";
// import Pod from "../../structs/Pod";
import Service from "../../structs/Service";
// import ServiceActionDisabledModal from "../../components/modals/ServiceActionDisabledModal";
import {
  DELETE,
  EDIT,
  MORE,
  OPEN,
  RESTART,
  RESUME,
  SCALE,
  STOP
} from "../../constants/ServiceActionItem";
import ServiceStatus from "../../constants/ServiceStatus";
// import ServiceActionLabels from "../../constants/ServiceActionLabels";
// import ServiceTableHeaderLabels from "../../constants/ServiceTableHeaderLabels";
// import ServiceTableUtil from "../../utils/ServiceTableUtil";
import ServiceTree from "../../structs/ServiceTree";
// import ServiceStatusIcon from "../../components/ServiceStatusIcon";

import { nameRenderer } from "../../columns/ServicesTableNameColumn.tsx";
import { statusRenderer } from "../../columns/ServicesTableStatusColumn.tsx";
import { versionRenderer } from "../../columns/ServicesTableVersionColumn.tsx";
import { regionRenderer } from "../../columns/ServicesTableRegionColumn.tsx";
import { instancesRenderer } from "../../columns/ServicesTableInstancesColumn.tsx";
import { cpuRenderer } from "../../columns/ServicesTableCPUColumn.tsx";
import { memRenderer } from "../../columns/ServicesTableMemColumn.tsx";
import { diskRenderer } from "../../columns/ServicesTableDiskColumn.tsx";
import { gpuRenderer } from "../../columns/ServicesTableGPUColumn.tsx";
import { actionsRenderer } from "../../columns/ServicesTableActionsColumn.tsx";

// const StatusMapping = {
//   Running: "running-state"
// };

// const columnClasses = {
//   name: "service-table-column-name",
//   status: "service-table-column-status",
//   version: "service-table-column-version",
//   regions: "service-table-column-regions",
//   instances: "service-table-column-instances",
//   cpus: "service-table-column-cpus",
//   mem: "service-table-column-mem",
//   disk: "service-table-column-disk",
//   actions: "service-table-column-actions",
//   gpus: "service-table-column-gpus"
// };

const METHODS_TO_BIND = [
  "onActionsItemSelection",
  "handleServiceAction",
  "handleActionDisabledModalOpen",
  "handleActionDisabledModalClose",
  "handleSortClick"
  // "renderHeadline",
  //"renderRegions",
  //"renderStats",
  //"renderStatus",
  //"renderServiceActions"
];

class ServicesTable extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      actionDisabledService: null,
      data: [],
      sortColumn: "name",
      sortDirection: "ASC"
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      this.updateData(
        nextProps.services,
        this.state.sortColumn,
        this.state.sortDirection
      )
    );
  }

  onActionsItemSelection(service, actionItem) {
    const isGroup = service instanceof ServiceTree;
    let containsSDKService = false;

    if (isGroup) {
      containsSDKService =
        // #findItem will flatten the service tree
        service.findItem(function(item) {
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
      this.handleActionDisabledModalOpen(service, actionItem.id);
    } else {
      this.handleServiceAction(service, actionItem.id);
    }
  }

  handleServiceAction(service, actionID) {
    const { modalHandlers, router } = this.context;

    switch (actionID) {
      case EDIT:
        router.push(
          `/services/detail/${encodeURIComponent(service.getId())}/edit/`
        );
        break;
      case SCALE:
        modalHandlers.scaleService({ service });
        break;
      case OPEN:
        modalHandlers.openServiceUI({ service });
        break;
      case RESTART:
        modalHandlers.restartService({ service });
        break;
      case RESUME:
        modalHandlers.resumeService({ service });
        break;
      case STOP:
        modalHandlers.stopService({ service });
        break;
      case DELETE:
        modalHandlers.deleteService({ service });
        break;
    }
  }

  handleActionDisabledModalOpen(actionDisabledService, actionDisabledID) {
    this.setState({ actionDisabledService, actionDisabledID });
  }

  handleActionDisabledModalClose() {
    this.setState({ actionDisabledService: null, actionDisabledID: null });
  }

  getOpenInNewWindowLink(service) {
    // This might be a serviceTree and therefore we need this check
    // And getWebURL might therefore not be available
    if (!this.hasWebUI(service)) {
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

  getServiceLink(service) {
    const id = encodeURIComponent(service.getId());
    const isGroup = service instanceof ServiceTree;
    const serviceLink = isGroup
      ? `/services/overview/${id}`
      : `/services/detail/${id}`;

    if (this.props.isFiltered) {
      return (
        <NestedServiceLinks
          serviceLink={serviceLink}
          serviceID={id}
          className="service-breadcrumb"
          majorLinkClassName="service-breadcrumb-service-id"
          minorLinkWrapperClassName="service-breadcrumb-crumb"
        />
      );
    }

    return (
      <Link className="table-cell-link-primary text-overflow" to={serviceLink}>
        {service.getName()}
      </Link>
    );
  }

  getImage(service) {
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

  handleSortClick(columnName) {
    const toggledDirection =
      this.state.sortDirection === "ASC" || this.state.sortColumn !== columnName
        ? "DESC"
        : "ASC";

    this.setState(
      this.updateData(
        this.state.data,
        columnName,
        toggledDirection,
        this.state.sortDirection,
        this.state.sortColumn
      )
    );
  }

  hasWebUI(service) {
    return (
      service instanceof Service &&
      !isSDKService(service) &&
      service.getWebURL() != null &&
      service.getWebURL() !== ""
    );
  }

  // renderHeadline(prop, service) {
  //   const id = encodeURIComponent(service.getId());
  //   const isGroup = service instanceof ServiceTree;
  //   const serviceLink = isGroup
  //     ? `/services/overview/${id}`
  //     : `/services/detail/${id}`;

  //   return (
  //     <div className="service-table-heading flex-box flex-box-align-vertical-center table-cell-flex-box">
  //       <Link className="table-cell-icon" to={serviceLink}>
  //         {this.getImage(service)}
  //       </Link>
  //       <span className="table-cell-value table-cell-flex-box">
  //         {this.getServiceLink(service)}
  //         {this.getOpenInNewWindowLink(service)}
  //       </span>
  //     </div>
  //   );
  // }

  // renderRegions(prop, service) {
  //   const localRegion = CompositeState.getMasterNode().getRegionName();
  //   let regions = service.getRegions();

  //   regions = regions.map(
  //     region => (region === localRegion ? region + " (Local)" : region)
  //   );

  //   if (regions.length === 0) {
  //     regions.push("N/A");
  //   }

  //   return (
  //     <Tooltip
  //       elementTag="span"
  //       wrapperClassName="tooltip-wrapper tooltip-block-wrapper text-overflow"
  //       wrapText={true}
  //       content={regions.join(", ")}
  //     >
  //       {regions.join(", ")}
  //     </Tooltip>
  //   );
  // }

  // renderServiceActions(prop, service) {
  //   const isGroup = service instanceof ServiceTree;
  //   const isPod = service instanceof Pod;
  //   const isSingleInstanceApp = service.getLabels()
  //     .MARATHON_SINGLE_INSTANCE_APP;
  //   const instancesCount = service.getInstancesCount();
  //   const scaleTextID = isGroup
  //     ? ServiceActionLabels.scale_by
  //     : ServiceActionLabels[SCALE];
  //   const isSDK = isSDKService(service);

  //   const actions = [];

  //   actions.push({
  //     className: "hidden",
  //     id: MORE,
  //     html: "",
  //     selectedHtml: <Icon id="ellipsis-vertical" size="mini" />
  //   });

  //   if (this.hasWebUI(service)) {
  //     actions.push({
  //       id: OPEN,
  //       html: <Trans render="span" id={ServiceActionLabels.open} />
  //     });
  //   }

  //   if (!isGroup) {
  //     actions.push({
  //       id: EDIT,
  //       html: <Trans render="span" id={ServiceActionLabels.edit} />
  //     });
  //   }

  //   // isSingleInstanceApp = Framework main scheduler
  //   // instancesCount = service instances
  //   if ((isGroup && instancesCount > 0) || (!isGroup && !isSingleInstanceApp)) {
  //     actions.push({
  //       id: SCALE,
  //       html: <Trans render="span" id={scaleTextID} />
  //     });
  //   }

  //   if (!isPod && !isGroup && instancesCount > 0 && !isSDK) {
  //     actions.push({
  //       id: RESTART,
  //       html: <Trans render="span" id={ServiceActionLabels[RESTART]} />
  //     });
  //   }

  //   if (instancesCount > 0 && !isSDK) {
  //     actions.push({
  //       id: STOP,
  //       html: <Trans render="span" id={ServiceActionLabels[STOP]} />
  //     });
  //   }

  //   if (!isGroup && instancesCount === 0 && !isSDK) {
  //     actions.push({
  //       id: RESUME,
  //       html: <Trans render="span" id={ServiceActionLabels[RESUME]} />
  //     });
  //   }

  //   actions.push({
  //     id: DELETE,
  //     html: (
  //       <Trans
  //         render="span"
  //         className="text-danger"
  //         id={ServiceActionLabels[DELETE]}
  //       />
  //     )
  //   });

  //   if (service.getServiceStatus() === ServiceStatus.DELETING) {
  //     return this.renderServiceActionsDropdown(service, actions);
  //   }

  //   return (
  //     <Tooltip content={<Trans render="span">More actions</Trans>}>
  //       {this.renderServiceActionsDropdown(service, actions)}
  //     </Tooltip>
  //   );
  // }

  renderServiceActionsDropdown(service, actions) {
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
        onItemSelection={this.onActionsItemSelection.bind(this, service)}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        title="More actions"
        transition={true}
        transitionName="dropdown-menu"
        disabled={service.getServiceStatus() === ServiceStatus.DELETING}
      />
    );
  }

  // renderStatus(prop, service) {
  //   const serviceStatusText = service.getStatus();
  //   const serviceStatusClassSet = StatusMapping[serviceStatusText] || "";
  //   const instancesCount = service.getInstancesCount();
  //   const runningInstances = service.getRunningInstancesCount();

  //   // L10NTODO: Pluralize
  //   const tooltipContent = (
  //     <Trans render="span">
  //       {runningInstances} {StringUtil.pluralize("instance", runningInstances)}{" "}
  //       running out of {instancesCount}
  //     </Trans>
  //   );
  //   const hasStatusText = serviceStatusText !== ServiceStatus.NA.displayName;

  //   return (
  //     <div className="flex">
  //       <div className={`${serviceStatusClassSet} service-status-icon-wrapper`}>
  //         <ServiceStatusIcon
  //           service={service}
  //           showTooltip={true}
  //           tooltipContent={tooltipContent}
  //         />
  //         {hasStatusText && (
  //           <Trans
  //             id={serviceStatusText}
  //             render="span"
  //             className="status-bar-text"
  //           />
  //         )}
  //       </div>
  //       <div className="service-status-progressbar-wrapper">
  //         <ServiceStatusProgressBar service={service} />
  //       </div>
  //     </div>
  //   );
  // }

  // renderStats(prop, service) {
  //   const resource = service.getResources()[prop];

  //   return <span>{Units.formatResource(prop, resource)}</span>;
  // }

  // renderVersion(prop, service) {
  //   const version = ServiceTableUtil.getFormattedVersion(service);
  //   if (!version) {
  //     return null;
  //   }

  //   return (
  //     <Tooltip
  //       content={version.rawVersion}
  //       wrapperClassName="tooltip-wrapper tooltip-block-wrapper text-overflow"
  //       wrapText={true}
  //     >
  //       {version.displayVersion}
  //     </Tooltip>
  //   );
  // }

  // renderInstances(prop, service) {
  //   const instancesCount = service.getInstancesCount();
  //   const runningInstances = service.getRunningInstancesCount();
  //   const overview =
  //     runningInstances === instancesCount
  //       ? ` ${runningInstances}`
  //       : ` ${runningInstances}/${instancesCount}`;

  //   const content = !Number.isInteger(instancesCount)
  //     ? EmptyStates.CONFIG_VALUE
  //     : overview;

  //   // L10NTODO: Pluralize
  //   const tooltipContent = (
  //     <Trans render="span">
  //       {runningInstances} {StringUtil.pluralize("instance", runningInstances)}{" "}
  //       running out of {instancesCount}
  //     </Trans>
  //   );

  //   return (
  //     <Tooltip content={tooltipContent}>
  //       <span>{content}</span>
  //     </Tooltip>
  //   );
  // }

  // getCellClasses(prop, sortBy, row) {
  //   const isHeader = row == null;

  //   return classNames(columnClasses[prop], {
  //     active: prop === sortBy.prop,
  //     clickable: isHeader
  //   });
  // }

  // getColumns() {
  //   const heading = ResourceTableUtil.renderHeading(ServiceTableHeaderLabels);

  //   return [
  //     {
  //       className: this.getCellClasses,
  //       headerClassName: this.getCellClasses,
  //       prop: "name",
  //       render: this.renderHeadline,
  //       sortable: true,
  //       sortFunction: ServiceTableUtil.propCompareFunctionFactory,
  //       heading
  //     },
  //     {
  //       className: this.getCellClasses,
  //       headerClassName: this.getCellClasses,
  //       prop: "status",
  //       helpText: (
  //         <Trans render="span">
  //           At-a-glance overview of the global application or group state.{" "}
  //           <a
  //             href={MetadataStore.buildDocsURI(
  //               "/deploying-services/task-handling"
  //             )}
  //             target="_blank"
  //           >
  //             Read more
  //           </a>.
  //         </Trans>
  //       ),
  //       render: this.renderStatus,
  //       sortable: true,
  //       sortFunction: ServiceTableUtil.propCompareFunctionFactory,
  //       heading
  //     },
  //     {
  //       className: this.getCellClasses,
  //       headerClassName: this.getCellClasses,
  //       prop: "version",
  //       render: this.renderVersion,
  //       sortable: true,
  //       sortFunction: ServiceTableUtil.propCompareFunctionFactory,
  //       heading
  //     },
  //     {
  //       className: this.getCellClasses,
  //       headerClassName: this.getCellClasses,
  //       prop: "regions",
  //       render: this.renderRegions,
  //       sortable: true,
  //       sortFunction: ServiceTableUtil.propCompareFunctionFactory,
  //       heading
  //     },
  //     {
  //       className: this.getCellClasses,
  //       headerClassName: this.getCellClasses,
  //       prop: "instances",
  //       render: this.renderInstances,
  //       sortable: true,
  //       sortFunction: ServiceTableUtil.propCompareFunctionFactory,
  //       heading
  //     },
  //     {
  //       className: this.getCellClasses,
  //       headerClassName: this.getCellClasses,
  //       prop: "cpus",
  //       render: this.renderStats,
  //       sortable: true,
  //       sortFunction: ServiceTableUtil.propCompareFunctionFactory,
  //       heading
  //     },
  //     {
  //       className: this.getCellClasses,
  //       headerClassName: this.getCellClasses,
  //       prop: "mem",
  //       render: this.renderStats,
  //       sortable: true,
  //       sortFunction: ServiceTableUtil.propCompareFunctionFactory,
  //       heading
  //     },
  //     {
  //       className: this.getCellClasses,
  //       headerClassName: this.getCellClasses,
  //       prop: "disk",
  //       render: this.renderStats,
  //       sortable: true,
  //       sortFunction: ServiceTableUtil.propCompareFunctionFactory,
  //       heading
  //     },
  //     {
  //       className: this.getCellClasses,
  //       headerClassName: this.getCellClasses,
  //       prop: "gpus",
  //       render: this.renderStats,
  //       sortable: true,
  //       sortFunction: ServiceTableUtil.propCompareFunctionFactory,
  //       heading
  //     },
  //     {
  //       className: this.getCellClasses,
  //       headerClassName: this.getCellClasses,
  //       prop: "actions",
  //       render: this.renderServiceActions,
  //       sortable: false,
  //       heading() {
  //         return null;
  //       }
  //     }
  //   ];
  // }

  // getColGroup() {
  //   return (
  //     <colgroup>
  //       <col className={columnClasses.name} />
  //       <col className={columnClasses.status} />
  //       <col className={columnClasses.version} />
  //       <col className={columnClasses.regions} />
  //       <col className={columnClasses.instances} />
  //       <col className={columnClasses.cpus} />
  //       <col className={columnClasses.mem} />
  //       <col className={columnClasses.disk} />
  //       <col className={columnClasses.gpus} />
  //       <col className={columnClasses.actions} />
  //     </colgroup>
  //   );
  // }

  retrieveSortFunction(sortColumn) {
    switch (sortColumn) {
      case "host":
        return ipSorter;
      case "type":
        return typeSorter;
      case "region":
        return regionSorter;
      case "zone":
        return zoneSorter;
      case "health":
        return healthSorter;
      case "tasks":
        return tasksSorter;
      case "cpu":
        return cpuSorter;
      case "mem":
        return memSorter;
      case "disk":
        return diskSorter;
      case "gpu":
        return gpuSorter;
      default:
        return (data, _sortDirection) => data;
    }
  }

  updateData(
    data,
    sortColumn,
    sortDirection,
    currentSortDirection,
    currentSortColumn
  ) {
    const copiedData = data.slice();

    if (
      sortDirection === currentSortDirection &&
      sortColumn === currentSortColumn
    ) {
      return { data: copiedData, sortDirection, sortColumn };
    }

    if (
      sortDirection !== currentSortDirection &&
      sortColumn === currentSortColumn
    ) {
      return { data: copiedData.reverse(), sortDirection, sortColumn };
    }

    const sortFunction = this.retrieveSortFunction(sortColumn);

    return {
      data: sortFunction(copiedData, sortDirection),
      sortDirection,
      sortColumn
    };
  }

  render() {
    const {
      actionDisabledService,
      actionDisabledID,
      data,
      sortColumn,
      sortDirection
    } = this.state;
    // const data = this.props.services;

    return (
      <Table
        // buildRowOptions={this.getRowAttributes}
        // className="table service-table table-flush table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
        // columns={this.getColumns()}
        // colGroup={this.getColGroup()}
        data={data.slice()}
        // itemHeight={TableUtil.getRowHeight()}
        // containerSelector=".gm-scroll-view"
        // sortBy={{ prop: "name", order: "asc" }}
      >
        <Column
          header={
            <SortableHeaderCell
              columnContent={<Trans render="span">Name</Trans>}
              sortHandler={this.handleSortClick.bind(null, "name")}
              sortDirection={sortColumn === "name" ? sortDirection : null}
            />
          }
          cellRenderer={nameRenderer}
          minWidth={200}
        />

        <Column
          header={
            <SortableHeaderCell
              columnContent={
                <div>
                  <Trans render="span">Status</Trans>{" "}
                  <Tooltip
                    content={
                      <Trans render="span">
                        At-a-glance overview of the global application or group
                        state.{" "}
                        <a
                          href={MetadataStore.buildDocsURI(
                            "/deploying-services/task-handling"
                          )}
                          target="_blank"
                        >
                          Read more
                        </a>.
                      </Trans>
                    }
                  >
                    tt
                  </Tooltip>
                  />
                </div>
              }
              sortHandler={this.handleSortClick.bind(null, "status")}
              sortDirection={sortColumn === "status" ? sortDirection : null}
            />
          }
          cellRenderer={statusRenderer}
        />

        <Column
          header={
            <SortableHeaderCell
              columnContent={<Trans render="span">Version</Trans>}
              sortHandler={this.handleSortClick.bind(null, "version")}
              sortDirection={sortColumn === "version" ? sortDirection : null}
            />
          }
          cellRenderer={versionRenderer}
        />

        <Column
          header={
            <SortableHeaderCell
              columnContent={<Trans render="span">Region</Trans>}
              sortHandler={this.handleSortClick.bind(null, "region")}
              sortDirection={sortColumn === "region" ? sortDirection : null}
            />
          }
          cellRenderer={regionRenderer}
        />

        <Column
          header={
            <SortableHeaderCell
              columnContent={<Trans render="span">Instances</Trans>}
              sortHandler={this.handleSortClick.bind(null, "instances")}
              sortDirection={sortColumn === "instances" ? sortDirection : null}
            />
          }
          cellRenderer={instancesRenderer}
        />

        <Column
          header={
            <SortableHeaderCell
              columnContent={<Trans render="span">CPU</Trans>}
              sortHandler={this.handleSortClick.bind(null, "cpus")}
              sortDirection={sortColumn === "cpus" ? sortDirection : null}
            />
          }
          cellRenderer={cpuRenderer}
        />

        <Column
          header={
            <SortableHeaderCell
              columnContent={<Trans render="span">Mem</Trans>}
              sortHandler={this.handleSortClick.bind(null, "mem")}
              sortDirection={sortColumn === "mem" ? sortDirection : null}
            />
          }
          cellRenderer={memRenderer}
        />

        <Column
          header={
            <SortableHeaderCell
              columnContent={<Trans render="span">Disk</Trans>}
              sortHandler={this.handleSortClick.bind(null, "disk")}
              sortDirection={sortColumn === "disk" ? sortDirection : null}
            />
          }
          cellRenderer={diskRenderer}
        />

        <Column
          header={
            <SortableHeaderCell
              columnContent={<Trans render="span">GPU</Trans>}
              sortHandler={this.handleSortClick.bind(null, "gpus")}
              sortDirection={sortColumn === "gpus" ? sortDirection : null}
            />
          }
          cellRenderer={gpuRenderer}
        />

        <Column cellRenderer={actionsRenderer} />
      </Table>
    );
  }
}

ServicesTable.contextTypes = {
  modalHandlers: PropTypes.shape({
    scaleService: PropTypes.func,
    restartService: PropTypes.func,
    resumeService: PropTypes.func,
    stopService: PropTypes.func,
    deleteService: PropTypes.func
  }).isRequired,
  router: routerShape
};

ServicesTable.defaultProps = {
  isFiltered: false,
  services: []
};

ServicesTable.propTypes = {
  isFiltered: PropTypes.bool,
  services: PropTypes.array
};

module.exports = ServicesTable;
