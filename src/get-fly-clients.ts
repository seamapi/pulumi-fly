import * as pulumi from "@pulumi/pulumi"
import default_axios from "axios"

export const getFlyClients = (config?: pulumi.Config) => {
  if (!config) config = new pulumi.Config()
  const fly_api_key = config.requireSecret("fly_api_key")

  const machineApi = default_axios.create({
    baseURL: "https://api.machines.dev",
    headers: {
      Authorization: `Bearer ${fly_api_key.get()}`,
    },
    validateStatus: () => true,
  } as any)
  const gqlApi = default_axios.create({
    baseURL: "https://api.fly.io/graphql",
    headers: {
      Authorization: `Bearer ${fly_api_key.get()}`,
    },
    validateStatus: () => true,
  } as any)
  return { machineApi, gqlApi }
}
