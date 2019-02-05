import { of, throwError } from "rxjs";
import { map, retry } from "rxjs/operators";
import { RequestResponse } from "@dcos/http-service";
import { makeExecutableSchema } from "graphql-tools";
import { DCOSUIUpdateClient, UIVersionResponse } from "dcos-ui-update-client";

import Config from "#SRC/js/config/Config";
import { UIVersionSchema } from "#SRC/js/types/UIVersion";

export interface ResolverArgs {
  uiUpdateClient: DCOSUIUpdateClient;
}

export interface GeneralArgs {
  [key: string]: any;
}

export interface UIUpdateArgs {
  newVersion: string;
}

function isUIUpdateArgs(args: GeneralArgs): args is UIUpdateArgs {
  return (args as UIUpdateArgs).newVersion !== undefined;
}

function resolvers({ uiUpdateClient }: ResolverArgs) {
  return {
    UIVersion: {
      clientBuild() {
        // @ts-ignore
        return of(window.DCOS_UI_VERSION);
      },
      packageVersion() {
        return uiUpdateClient.fetchVersion().pipe(
          map((reqResp: RequestResponse<UIVersionResponse>) => {
            if (reqResp.code > 200) {
              throw new Error(
                `${reqResp.code} ${reqResp.message} - ${reqResp.response}`
              );
            }
            return reqResp.response.packageVersion;
          }),
          retry(2)
        );
      },
      packageVersionIsDefault() {
        return uiUpdateClient.fetchVersion().pipe(
          map((reqResp: RequestResponse<UIVersionResponse>) => {
            if (reqResp.code > 200) {
              throw new Error(
                `${reqResp.code} ${reqResp.message} - ${reqResp.response}`
              );
            }
            return reqResp.response.default;
          }),
          retry(2)
        );
      }
    },
    Query: {
      ui() {
        return of({});
      }
    },
    Mutation: {
      updateDCOSUI(_parent = {}, args: GeneralArgs = {}) {
        if (!isUIUpdateArgs(args)) {
          return throwError(
            "updateDCOSUI arguments aren't valid for type UIUpdateArgs"
          );
        }
        return uiUpdateClient.updateUIVersion(args.newVersion).pipe(
          map(({ code, response }: RequestResponse<string>) => {
            if (code >= 300) {
              return `Error (${code}): ${response}`;
            }
            return `Complete: ${args.newVersion}`;
          })
        );
      },
      resetDCOSUI() {
        return uiUpdateClient.resetUIVersion().pipe(
          map(({ code, response }: RequestResponse<string>) => {
            if (code >= 300) {
              return `Error (${code}): ${response}`;
            }
            return `Complete: Default`;
          })
        );
      }
    }
  };
}

const baseSchema = `
type Query {
  ui: UIVersion!
}
type Mutation {
  updateDCOSUI(version: string): String!
  resetDCOSUI(): String!
}
`;

const schemas = [UIVersionSchema, baseSchema];

export default makeExecutableSchema({
  typeDefs: schemas,
  resolvers: resolvers({
    uiUpdateClient: new DCOSUIUpdateClient(Config.rootUrl)
  })
});
