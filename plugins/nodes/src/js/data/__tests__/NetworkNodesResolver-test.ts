import { NetworkNodesResponse } from "../NetworkNodesClient";

import { take } from "rxjs/operators";
import { marbles } from "rxjs-marbles/jest";
import { makeExecutableSchema } from "graphql-tools";
import { graphqlObservable } from "@dcos/data-service";
import gql from "graphql-tag";

import { schemas, resolvers } from "../NetworkNodesResolver";

const mockRequest = jest.fn();
jest.mock("@dcos/http-service", () => ({
  request: mockRequest
}));

function makeFakeNetworkNodesResponse(): NetworkNodesResponse {
  return [
    {
      updated: "2019-02-05T13:12:00.979Z",
      public_ips: ["3.121.127.82"],
      private_ip: "10.0.6.106",
      hostname: "ip-10-0-6-106"
    },
    {
      updated: "2019-02-05T13:10:47.965Z",
      public_ips: ["35.158.134.216"],
      private_ip: "10.0.5.238",
      hostname: "ip-10-0-5-238"
    },
    {
      updated: "2019-02-05T13:12:01.553Z",
      public_ips: [],
      private_ip: "10.0.1.28",
      hostname: "ip-10-0-1-28"
    }
  ];
}

function makeResolverConfig(m: any) {
  return {
    fetchNetworkNodes: () =>
      m.cold("(j|)", {
        j: {
          code: 200,
          message: "ok",
          response: makeFakeNetworkNodesResponse()
        }
      }),
    pollingInterval: m.time("--|")
  };
}

describe("Nodes data-layer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("network", () => {
    it(
      "handles a graphql query",
      marbles(m => {
        const serviceSchema = makeExecutableSchema({
          typeDefs: schemas,
          resolvers: resolvers(makeResolverConfig(m))
        });

        const query = gql`
          query {
            nodes(privateIP: $privateIP) {
              hostname
              network {
                public_ips
              }
            }
          }
        `;

        const queryResult$ = graphqlObservable(query, serviceSchema, {
          privateIP: "10.0.5.238"
        });

        const result$ = queryResult$.pipe(take(1));

        const expected$ = m.cold("(j|)", {
          j: {
            data: {
              nodes: [
                {
                  hostname: "10.0.5.238",
                  network: {
                    public_ips: ["35.158.134.216"]
                  }
                }
              ]
            }
          }
        });

        m.expect(result$).toBeObservable(expected$);
      })
    );
  });
});
