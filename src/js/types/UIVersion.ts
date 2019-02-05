export interface UIVersion {
  clientBuildVersion: string;
  PackageVersion: string;
  PackageVersionIsDefault: boolean;
}

export const UIVersionSchema = `
  type UIVersion {
    clientBuild: String!
    packageVersion: String!
    packageVersionIsDefault: Boolean!
  }
`;
