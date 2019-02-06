import { Observable, timer, throwError, of } from "rxjs";
import { RequestResponse } from "@dcos/http-service";
import {
  NetworkNodesResponse,
  NetworkNode,
  fetchNetworkNodes
} from "./NetworkNodesClient";
import { switchMap, map } from "rxjs/operators";
import { makeExecutableSchema } from "graphql-tools";
import Config from "#SRC/js/config/Config";

export interface ResolverArgs {
  fetchNetworkNodes: () => Observable<RequestResponse<NetworkNode[]>>;
  pollingInterval: number;
}

export interface GeneralArgs {
  privateIP?: string;
}

// TODO: [ ] rename to NodesResolver

export interface NodesQueryArgs {
  privateIP: string;
}

function isNodesQueryArgs(args: GeneralArgs): args is NodesQueryArgs {
  return (args as NodesQueryArgs).privateIP !== undefined;
}

export const resolvers = ({
  fetchNetworkNodes,
  pollingInterval
}: ResolverArgs) => ({
  Node: {
    network(parent: { privateIP: string }) {
      const pollingInterval$ = timer(0, pollingInterval);
      const nodes$ = pollingInterval$.pipe(
        switchMap(() => fetchNetworkNodes()),
        map(
          (reqResp: RequestResponse<NetworkNodesResponse>): NetworkNode[] => {
            return [...reqResp.response];
          }
        )
      );

      return nodes$.pipe(
        map((networkNodes: NetworkNode[]) =>
          networkNodes.find(({ private_ip }) => private_ip === parent.privateIP)
        )
      );
    }
  },
  Query: {
    node(_parent = {}, args: GeneralArgs = {}) {
      if (!isNodesQueryArgs(args)) {
        return throwError(
          "Nodes resolver arguments aren't valid for type nodesQueryArgs"
        );
      }
      return of({ hostname: args.privateIP, privateIP: args.privateIP });
    },
    nodes(_parent = {}, args: GeneralArgs = {}) {
      if (!isNodesQueryArgs(args)) {
        return throwError(
          "Nodes resolver arguments aren't valid for type nodesQueryArgs"
        );
      }
      return of([{ hostname: args.privateIP, privateIP: args.privateIP }]);
    }
  }
});

const baseSchema = `
type NetworkNode {
  updated: String
  public_ips: [String]
  private_ip: String
  hostname: String
}

type Node {
  hostname: String
  network(privateIP: String!): NetworkNode
}

type Query {
  nodes: [Node]
  node: Node
}`;
// test

export const schemas: string[] = [baseSchema];

export interface Query {
  network: NetworkNode | null;
}

export default makeExecutableSchema({
  typeDefs: schemas,
  resolvers: resolvers({
    fetchNetworkNodes,
    pollingInterval: Config.getRefreshRate()
  })
});
