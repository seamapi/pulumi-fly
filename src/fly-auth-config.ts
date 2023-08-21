import * as pulumi from "@pulumi/pulumi"

export const getFlyRegistry = (config: pulumi.Config) => ({
  hostName: "registry.fly.io",
  userName: "x",
  password: config.requireSecret("fly_api_key"),
})
