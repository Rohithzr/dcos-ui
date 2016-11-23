import React, {PropTypes} from 'react';

import JSONEditor from '../../../../../../src/js/components/JSONEditor';

import AppValidators from '../../../../../../src/resources/raml/marathon/v2/types/app.raml';
import DataValidatorUtil from '../../../../../../src/js/utils/DataValidatorUtil';
import PodValidators from '../../../../../../src/resources/raml/marathon/v2/types/pod.raml';
import ServiceValidatorUtil from '../../utils/ServiceValidatorUtil';
import ServiceUtil from '../../utils/ServiceUtil';

const METHODS_TO_BIND = [
  'handleJSONChange'
];

const APP_ERROR_VALIDATORS = [
  AppValidators.App
];

const POD_ERROR_VALIDATORS = [
  PodValidators.Pod
];

class CreateServiceJsonOnly extends React.Component {

  constructor() {
    super(...arguments);

    this.state = Object.assign(
      {
        errorList: [],
        appConfig: {}
      },
      this.getNewStateForJSON(
        ServiceUtil.getServiceJSON(this.props.service)
      )
    );

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * @override
   */
  componentDidUpdate(prevProps, prevState) {
    let hasErrors = this.state.errorList.length !== 0;
    let hadErrors = prevState.errorList.length !== 0;

    // Notify parent component for our error state
    if (hasErrors !== hadErrors) {
      this.props.onErrorStateChange(hasErrors);
    }
  }

  /**
   * @override
   */
  componentWillReceiveProps(nextProps) {
    this.setState(
      this.getNewStateForJSON(
        ServiceUtil.getServiceJSON(nextProps.service)
      )
    );
  }

  handleJSONChange(jsonObject) {
    this.props.onChange(jsonObject);
  }

  getNewStateForJSON(appConfig) {
    let isPod = ServiceValidatorUtil.isPodSpecDefinition(appConfig);

    // Pick validators according to JSON specification type
    let validators = APP_ERROR_VALIDATORS;
    if (isPod) {
      validators = POD_ERROR_VALIDATORS;
    }

    // Compile the list of errors
    let errorList = DataValidatorUtil.validate(appConfig, validators);

    // Update the error display
    return {appConfig, errorList};
  }

  render() {
    let {appConfig, errorList} = this.state;

    return (
      <div className="flex flex-item-grow-1">
        <div className="container">
          <JSONEditor
            errors={errorList}
            onChange={this.handleJSONChange}
            showGutter={true}
            showPrintMargin={false}
            theme="monokai"
            height="400px"
            value={appConfig}
            width="100%" />
        </div>
      </div>
    );
  }
}

CreateServiceJsonOnly.defaultProps = {
  onChange() {},
  onErrorStateChange() {}
};

CreateServiceJsonOnly.propTypes = {
  onChange: PropTypes.func,
  onErrorStateChange: PropTypes.func,
  service: PropTypes.object
};

module.exports = CreateServiceJsonOnly;
