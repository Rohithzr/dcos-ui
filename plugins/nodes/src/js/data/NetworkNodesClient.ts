import { Observable, merge } from "rxjs";
import { request, RequestResponse } from "@dcos/http-service";
import { partition, tap } from "rxjs/operators";

export interface NetworkNode {
  updated: string;
  public_ips: string[];
  private_ip: string;
  hostname: string;
}

export type NetworkNodesResponse = NetworkNode[];

export function fetchNetworkNodes(): Observable<RequestResponse<string[]>> {
  const [success, error] = partition(
    (response: RequestResponse<any>) => response.code < 300
  )(request("/net/v1/nodes"));

  return merge(
    success,
    error.pipe(
      tap((response: RequestResponse<any>) => {
        const responseMessage =
          response.response && typeof response.response === "object"
            ? JSON.stringify(response.response)
            : response.response;
        throw new Error(
          `Network Nodes API request failed: ${response.code} ${
            response.message
          }:${responseMessage}`
        );
      })
    )
  );
}
