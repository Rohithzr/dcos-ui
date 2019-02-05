const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { marbles } from "rxjs-marbles/jest";
import { from } from "rxjs";
import { take } from "rxjs/operators";

import { DCOSUIUpdateClient } from "../DCOSUIUpdateClient";

describe("DCOSUIUpdateClient", () => {
  let client: DCOSUIUpdateClient;
  beforeEach(() => {
    jest.clearAllMocks();

    client = new DCOSUIUpdateClient("/");
  });

  describe("#fetchVersion", () => {
    it("makes a request", () => {
      mockRequest.mockReturnValueOnce(from([{}]));
      client.fetchVersion();
      expect(mockRequest).toHaveBeenCalled();
    });

    it("calls correct endpoint", () => {
      mockRequest.mockReturnValueOnce(from([{}]));
      client.fetchVersion();
      expect(mockRequest).toHaveBeenCalledWith(
        "/dcos-ui-update-service/api/v1/version/"
      );
    });

    it(
      "parses Default",
      marbles(m => {
        const mockResult$ = m.cold("--(j|)", {
          j: {
            code: 200,
            message: "OK",
            response: "Default"
          }
        });
        mockRequest.mockReturnValueOnce(mockResult$);

        const result$ = client.fetchVersion().pipe(take(1));
        m.expect(result$).toBeObservable(
          m.cold("--(j|)", {
            j: {
              code: 200,
              message: "OK",
              response: {
                default: true,
                packageVersion: ""
              }
            }
          })
        );
      })
    );

    it(
      "parses package version",
      marbles(m => {
        const mockResult$ = m.cold("--(j|)", {
          j: {
            code: 200,
            message: "OK",
            response: "1.0.1"
          }
        });
        mockRequest.mockReturnValueOnce(mockResult$);

        const result$ = client.fetchVersion().pipe(take(1));
        m.expect(result$).toBeObservable(
          m.cold("--(j|)", {
            j: {
              code: 200,
              message: "OK",
              response: {
                default: false,
                packageVersion: "1.0.1"
              }
            }
          })
        );
      })
    );

    it(
      "can handle json response",
      marbles(m => {
        const mockResult$ = m.cold("--(j|)", {
          j: {
            code: 200,
            message: "OK",
            response: {
              default: false,
              packageVersion: "1.2.3",
              buildVersion: "master+v1.2.3+abcdefg"
            }
          }
        });
        mockRequest.mockReturnValueOnce(mockResult$);

        const result$ = client.fetchVersion().pipe(take(1));
        m.expect(result$).toBeObservable(
          m.cold("--(j|)", {
            j: {
              code: 200,
              message: "OK",
              response: {
                default: false,
                packageVersion: "1.2.3",
                buildVersion: "master+v1.2.3+abcdefg"
              }
            }
          })
        );
      })
    );
  });
});
