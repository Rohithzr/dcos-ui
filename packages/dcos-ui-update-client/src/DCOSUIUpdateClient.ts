import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { request, RequestResponse } from "@dcos/http-service";

export interface UIVersionResponse {
  default: boolean;
  packageVersion: string;
}

export class DCOSUIUpdateClient {
  readonly rootURL: string;
  readonly updateServiceAPIPrefix: string = "dcos-ui-update-service/api/";

  constructor(rootURL: string) {
    this.rootURL = rootURL;
  }

  fetchVersion(): Observable<RequestResponse<UIVersionResponse>> {
    return request(
      `${this.rootURL}${this.updateServiceAPIPrefix}v1/version/`
    ).pipe(
      map((reqResp: RequestResponse<any>) => {
        if (reqResp.code === 200) {
          const { response } = reqResp;
          if (typeof response === "string") {
            if (response.startsWith("Default")) {
              reqResp.response = {
                default: true,
                packageVersion: ""
              };
            } else {
              reqResp.response = {
                default: false,
                packageVersion: response
              };
            }
          }
        }
        return reqResp;
      })
    );
  }

  updateUIVersion(
    newPackageVersion: string
  ): Observable<RequestResponse<string>> {
    return request(
      `${this.rootURL}${
        this.updateServiceAPIPrefix
      }v1/update/${newPackageVersion}/`,
      {
        method: "POST"
      }
    );
  }

  resetUIVersion(): Observable<RequestResponse<string>> {
    return request(`${this.rootURL}${this.updateServiceAPIPrefix}v1/reset/`, {
      method: "DELETE"
    });
  }
}
