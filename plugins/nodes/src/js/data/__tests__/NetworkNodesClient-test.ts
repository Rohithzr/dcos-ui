const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { from } from "rxjs";
import { marbles } from "rxjs-marbles/jest";
import { take } from "rxjs/operators";

import * as NetworkNodesClient from "../NetworkNodesClient";

describe("Network Nodes Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("makes a request", () => {
    mockRequest.mockReturnValueOnce(from([{}]));
    NetworkNodesClient.fetchNetworkNodes();
    expect(mockRequest).toHaveBeenCalled();
  });

  it(
    "emits an event when the data is received",
    marbles(m => {
      const expectedResult = [
        JSON.stringify({
          updated: "2019-02-04T14:17:12.697Z",
          public_ips: ["18.185.33.115"],
          private_ip: "10.0.6.192",
          hostname: "ip-10-0-6-192"
        })
      ];
      const expected$ = m.cold("--(j|)", {
        j: {
          response: expectedResult,
          code: 200,
          message: "OK"
        }
      });

      mockRequest.mockReturnValueOnce(expected$);

      const result$ = NetworkNodesClient.fetchNetworkNodes().pipe(take(1));
      m.expect(result$).toBeObservable(expected$);
    })
  );

  it(
    "emits an error if non-2XX API response",
    marbles(m => {
      const mockResult$ = m.cold("--j", {
        j: {
          code: 500,
          message: "Internal Server Error",
          response: []
        }
      });

      mockRequest.mockReturnValueOnce(mockResult$);

      const result$ = NetworkNodesClient.fetchNetworkNodes();

      const expected$ = m.cold("--#", undefined, {
        message:
          "Network Nodes API request failed: 500 Internal Server Error:[]",
        name: "Error"
      });

      m.expect(result$).toBeObservable(expected$);
    })
  );
});
