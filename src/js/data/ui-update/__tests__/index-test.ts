const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

import { marbles } from "rxjs-marbles/jest";
import { take } from "rxjs/operators";
import gql from "graphql-tag";
import { graphqlObservable } from "@dcos/data-service";

import { default as schema } from "#SRC/js/data/ui-update";

describe("UI-Update Service data-layer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Query ui", () => {
    it(
      "handles a graphql query",
      marbles(m => {
        const reqResp$ = m.cold("--j|", {
          j: {
            response: "2.50.1",
            code: 200,
            message: "OK"
          }
        });
        mockRequest.mockReturnValueOnce(reqResp$);

        const query = gql`
          query {
            ui {
              packageVersion
              packageVersionIsDefault
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, schema, {}).pipe(take(1));

        const expected$ = m.cold("--(j|)", {
          j: {
            data: {
              ui: {
                packageVersion: "2.50.1",
                packageVersionIsDefault: false
              }
            }
          }
        });

        m.expect(queryResult$).toBeObservable(expected$);
      })
    );
  });
});
