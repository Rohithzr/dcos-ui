import { FormattedMessage } from "react-intl";
import React from "react";
import { routerShape } from "react-router";

import Alert from "#SRC/js/components/Alert";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import DateUtil from "#SRC/js/utils/DateUtil";
import TimeAgo from "#SRC/js/components/TimeAgo";
import DeclinedOffersHelpText from "../../constants/DeclinedOffersHelpText";
import DeclinedOffersTable from "../../components/DeclinedOffersTable";
import MarathonStore from "../../stores/MarathonStore";
import RecentOffersSummary from "../../components/RecentOffersSummary";
import Service from "../../structs/Service";
import TaskStatsTable from "./TaskStatsTable";

const METHODS_TO_BIND = ["handleJumpToRecentOffersClick"];

class ServiceDebugContainer extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    MarathonStore.setShouldEmbedLastUnusedOffers(true);
  }

  componentWillUnmount() {
    MarathonStore.setShouldEmbedLastUnusedOffers(false);
  }

  getDeclinedOffersTable() {
    const { service } = this.props;

    if (!this.shouldShowDeclinedOfferTable()) {
      return null;
    }

    const queue = service.getQueue();

    return (
      <div>
        <ConfigurationMapHeading level={2}>
          <FormattedMessage
            id="XXXX"
            defaultMessage={`
          Details
        `}
          />
        </ConfigurationMapHeading>
        <DeclinedOffersTable
          offers={queue.declinedOffers.offers}
          service={service}
          summary={queue.declinedOffers.summary}
        />
      </div>
    );
  }

  getLastTaskFailureInfo() {
    const lastTaskFailure = this.props.service.getLastTaskFailure();
    if (lastTaskFailure == null) {
      return (
        <p>
          <FormattedMessage
            id="XXXX"
            defaultMessage={`This app does not have failed tasks`}
          />
        </p>
      );
    }

    const {
      version,
      timestamp,
      taskId,
      state,
      message,
      host
    } = lastTaskFailure;

    return (
      <ConfigurationMapSection>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <FormattedMessage
              id="XXXX"
              defaultMessage={`
            Task ID
          `}
            />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getValueText(taskId)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <FormattedMessage
              id="XXXX"
              defaultMessage={`
            State
          `}
            />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getValueText(state)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <FormattedMessage
              id="XXXX"
              defaultMessage={`
            Message
          `}
            />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getValueText(message)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <FormattedMessage
              id="XXXX"
              defaultMessage={`
            Host
          `}
            />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getValueText(host)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <FormattedMessage
              id="XXXX"
              defaultMessage={`
            Timestamp
          `}
            />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {timestamp} (<TimeAgo time={new Date(timestamp)} />)
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <FormattedMessage
              id="XXXX"
              defaultMessage={`
            Version
          `}
            />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {version} (<TimeAgo time={new Date(version)} />)
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getLastVersionChange() {
    const versionInfo = this.props.service.getVersionInfo();
    if (versionInfo == null) {
      return (
        <p>
          <FormattedMessage
            id="XXXX"
            defaultMessage={`This app does not have version change information`}
          />
        </p>
      );
    }

    const { lastScalingAt, lastConfigChangeAt } = versionInfo;
    let lastScaling = "No operation since last config change";
    if (lastScalingAt !== lastConfigChangeAt) {
      lastScaling = (
        <span>
          {lastScalingAt} (<TimeAgo time={new Date(lastScalingAt)} />)
        </span>
      );
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <FormattedMessage
              id="XXXX"
              defaultMessage={`
            Scale or Restart
          `}
            />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {lastScaling}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <FormattedMessage
              id="XXXX"
              defaultMessage={`
            Configuration
          `}
            />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {`${lastConfigChangeAt} `}
            (<TimeAgo time={new Date(lastConfigChangeAt)} />)
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getRecentOfferSummaryContent() {
    const { service } = this.props;

    if (!this.shouldShowDeclinedOfferSummary()) {
      return null;
    }

    return (
      <div>
        <ConfigurationMapHeading level={2}>
          <FormattedMessage
            id="XXXX"
            defaultMessage={`
          Summary
        `}
          />
        </ConfigurationMapHeading>
        <RecentOffersSummary data={service.getQueue().declinedOffers.summary} />
      </div>
    );
  }

  getRecentOfferSummaryCount() {
    const { service } = this.props;

    if (!this.shouldShowDeclinedOfferSummary()) {
      return null;
    }

    const queue = service.getQueue();
    const { declinedOffers: { summary } } = queue;
    const { roles: { offers = 0 } } = summary;

    return ` (${offers})`;
  }

  getRecentOfferSummaryDisabledText(frameworkName) {
    if (frameworkName != null) {
      return `Rejected offer analysis is not currently supported for ${frameworkName}.`;
    }

    return "Rejected offer analysis is not currently supported.";
  }

  getRecentOfferSummaryIntroText() {
    const { service } = this.props;

    if (this.isFramework(service)) {
      const frameworkName = service.getPackageName();

      return this.getRecentOfferSummaryDisabledText(frameworkName);
    }

    if (this.shouldShowDeclinedOfferSummary()) {
      return DeclinedOffersHelpText.summaryIntro;
    }

    return "Offers will appear here when your service is deploying or waiting for resources.";
  }

  getRecentOfferSummary() {
    const introText = this.getRecentOfferSummaryIntroText();
    const mainContent = this.getRecentOfferSummaryContent();
    const offerCount = this.getRecentOfferSummaryCount();

    return (
      <div
        ref={ref => {
          this.offerSummaryRef = ref;
        }}
      >
        <ConfigurationMapHeading>
          <FormattedMessage
            id="XXXX"
            defaultMessage={`
          Recent Resource Offers`}
          />{offerCount}
        </ConfigurationMapHeading>
        <p>{introText}</p>
        {mainContent}
      </div>
    );
  }

  getTaskStats() {
    const taskStats = this.props.service.getTaskStats();

    if (taskStats.getList().getItems().length === 0) {
      return (
        <p>
          <FormattedMessage
            id="XXXX"
            defaultMessage={`This app does not have task statistics`}
          />
        </p>
      );
    }

    return <TaskStatsTable taskStats={taskStats} />;
  }

  getValueText(value) {
    if (value == null || value === "") {
      return (
        <p><FormattedMessage id="XXXX" defaultMessage={`Unspecified`} /></p>
      );
    }

    return <span>{value}</span>;
  }

  getWaitingForResourcesNotice() {
    const { service } = this.props;

    if (this.isFramework(service)) {
      return null;
    }

    const queue = service.getQueue();

    if (queue == null || queue.since == null) {
      return null;
    }

    const waitingSince = DateUtil.strToMs(queue.since);
    const timeWaiting = Date.now() - waitingSince;

    // If the service has been waiting for less than five minutes, we don't
    // display the warning.
    if (timeWaiting < 1000 * 60 * 5) {
      return null;
    }

    return (
      <Alert>
        {
          "DC/OS has been waiting for resources and is unable to complete this deployment for "
        }
        {DateUtil.getDuration(timeWaiting, null)}{". "}
        <a className="clickable" onClick={this.handleJumpToRecentOffersClick}>
          <FormattedMessage
            id="XXXX"
            defaultMessage={`
          See recent resource offers
        `}
          />
        </a>.
      </Alert>
    );
  }

  handleJumpToRecentOffersClick() {
    if (this.offerSummaryRef) {
      this.offerSummaryRef.scrollIntoView();
    }
  }

  isFramework(service) {
    const { labels = {} } = service;

    return labels.DCOS_PACKAGE_FRAMEWORK_NAME != null;
  }

  shouldShowDeclinedOfferSummary() {
    const { service } = this.props;

    return (
      !this.shouldSuppressDeclinedOfferDetails() &&
      service.getQueue().declinedOffers.summary != null
    );
  }

  shouldShowDeclinedOfferTable() {
    const { service } = this.props;

    return (
      !this.shouldSuppressDeclinedOfferDetails() &&
      service.getQueue().declinedOffers.offers != null
    );
  }

  shouldSuppressDeclinedOfferDetails() {
    const { service } = this.props;
    const queue = service.getQueue();

    return queue == null || this.isFramework(service);
  }

  render() {
    return (
      <div className="container">
        {this.getWaitingForResourcesNotice()}
        <ConfigurationMap>
          <ConfigurationMapSection>
            <ConfigurationMapHeading>
              <FormattedMessage
                id="XXXX"
                defaultMessage={`
              Last Changes
            `}
              />
            </ConfigurationMapHeading>
            {this.getLastVersionChange()}
          </ConfigurationMapSection>
          <ConfigurationMapSection>
            <ConfigurationMapHeading>
              <FormattedMessage
                id="XXXX"
                defaultMessage={`
              Last Task Failure
            `}
              />
            </ConfigurationMapHeading>
            {this.getLastTaskFailureInfo()}
          </ConfigurationMapSection>
          <ConfigurationMapSection>
            <ConfigurationMapHeading>
              <FormattedMessage
                id="XXXX"
                defaultMessage={`
              Task Statistics
            `}
              />
            </ConfigurationMapHeading>
            {this.getTaskStats()}
          </ConfigurationMapSection>
          {this.getRecentOfferSummary()}
          {this.getDeclinedOffersTable()}
        </ConfigurationMap>
      </div>
    );
  }
}

ServiceDebugContainer.contextTypes = {
  router: routerShape
};

ServiceDebugContainer.propTypes = {
  service: React.PropTypes.instanceOf(Service)
};

module.exports = ServiceDebugContainer;
