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
      public_ips: ["3.2.2.96"],
      private_ip: "13.0.6.125",
      hostname: "ip-13-0-6-125"
    },
    {
      updated: "2019-02-05T13:10:47.965Z",
      public_ips: ["3.2.2.134"],
      private_ip: "13.0.6.96",
      hostname: "ip-13-0-6-96"
    },
    {
      updated: "2019-02-05T13:12:01.553Z",
      public_ips: [],
      private_ip: "13.0.1.42",
      hostname: "ip-13-0-1-42"
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

  describe("nodes", () => {
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
            privateIP: "13.0.6.96"
          });

          const result$ = queryResult$.pipe(take(1));

          const expected$ = m.cold("(j|)", {
            j: {
              data: {
                nodes: [
                  {
                    hostname: "13.0.6.96",
                    network: {
                      public_ips: ["3.2.2.134"]
                    }
                  }
                ]
              }
            }
          });

          m.expect(result$).toBeObservable(expected$);
        })
      );

      it(
        "returns a full network object",
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
                  hostname
                  private_ip
                  updated
                }
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, serviceSchema, {
            privateIP: "13.0.6.96"
          });

          const result$ = queryResult$.pipe(take(1));

          const expected$ = m.cold("(j|)", {
            j: {
              data: {
                nodes: [
                  {
                    hostname: "13.0.6.96",
                    network: {
                      updated: "2019-02-05T13:10:47.965Z",
                      public_ips: ["3.2.2.134"],
                      private_ip: "13.0.6.96",
                      hostname: "ip-13-0-6-96"
                    }
                  }
                ]
              }
            }
          });

          m.expect(result$).toBeObservable(expected$);
        })
      );

      it(
        "polls the endpoints",
        marbles(m => {
          const fetchNetworkNodes = () =>
            m.cold("j|", {
              j: {
                code: 200,
                message: "ok",
                response: [
                  {
                    updated: "2019-02-05T13:10:47.965Z",
                    public_ips: ["3.2.2.134"],
                    private_ip: "13.0.6.96",
                    hostname: "ip-13-0-6-96"
                  }
                ]
              }
            });
          const serviceSchema = makeExecutableSchema({
            typeDefs: schemas,
            resolvers: resolvers({
              fetchNetworkNodes,
              pollingInterval: m.time("--|")
            })
          });

          const query = gql`
            query {
              nodes(privateIP: $privateIP) {
                hostname
                network {
                  public_ips
                  hostname
                  private_ip
                  updated
                }
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, serviceSchema, {
            privateIP: "13.0.6.96"
          });

          const expected$ = m.cold("x-x-(x|)", {
            x: {
              data: {
                nodes: [
                  {
                    hostname: "13.0.6.96",
                    network: {
                      updated: "2019-02-05T13:10:47.965Z",
                      public_ips: ["3.2.2.134"],
                      private_ip: "13.0.6.96",
                      hostname: "ip-13-0-6-96"
                    }
                  }
                ]
              }
            }
          });

          m.expect(queryResult$.pipe(take(3))).toBeObservable(expected$);
        })
      );
    });
  });

  describe("node", () => {
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
              node(privateIP: $privateIP) {
                hostname
                network {
                  public_ips
                }
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, serviceSchema, {
            privateIP: "13.0.6.96"
          });

          const result$ = queryResult$.pipe(take(1));

          const expected$ = m.cold("(j|)", {
            j: {
              data: {
                node: {
                  hostname: "13.0.6.96",
                  network: {
                    public_ips: ["3.2.2.134"]
                  }
                }
              }
            }
          });

          m.expect(result$).toBeObservable(expected$);
        })
      );

      it(
        "returns a full network object",
        marbles(m => {
          const serviceSchema = makeExecutableSchema({
            typeDefs: schemas,
            resolvers: resolvers(makeResolverConfig(m))
          });

          const query = gql`
            query {
              node(privateIP: $privateIP) {
                hostname
                network {
                  public_ips
                  hostname
                  private_ip
                  updated
                }
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, serviceSchema, {
            privateIP: "13.0.6.96"
          });

          const result$ = queryResult$.pipe(take(1));

          const expected$ = m.cold("(j|)", {
            j: {
              data: {
                node: {
                  hostname: "13.0.6.96",
                  network: {
                    updated: "2019-02-05T13:10:47.965Z",
                    public_ips: ["3.2.2.134"],
                    private_ip: "13.0.6.96",
                    hostname: "ip-13-0-6-96"
                  }
                }
              }
            }
          });

          m.expect(result$).toBeObservable(expected$);
        })
      );

      it(
        "polls the endpoints",
        marbles(m => {
          const fetchNetworkNodes = () =>
            m.cold("j|", {
              j: {
                code: 200,
                message: "ok",
                response: [
                  {
                    updated: "2019-02-05T13:10:47.965Z",
                    public_ips: ["3.2.2.134"],
                    private_ip: "13.0.6.96",
                    hostname: "ip-13-0-6-96"
                  }
                ]
              }
            });
          const serviceSchema = makeExecutableSchema({
            typeDefs: schemas,
            resolvers: resolvers({
              fetchNetworkNodes,
              pollingInterval: m.time("--|")
            })
          });

          const query = gql`
            query {
              node(privateIP: $privateIP) {
                hostname
                network {
                  public_ips
                  hostname
                  private_ip
                  updated
                }
              }
            }
          `;

          const queryResult$ = graphqlObservable(query, serviceSchema, {
            privateIP: "13.0.6.96"
          });

          const expected$ = m.cold("x-x-(x|)", {
            x: {
              data: {
                node: {
                  hostname: "13.0.6.96",
                  network: {
                    updated: "2019-02-05T13:10:47.965Z",
                    public_ips: ["3.2.2.134"],
                    private_ip: "13.0.6.96",
                    hostname: "ip-13-0-6-96"
                  }
                }
              }
            }
          });

          m.expect(queryResult$.pipe(take(3))).toBeObservable(expected$);
        })
      );
    });
  });
});
