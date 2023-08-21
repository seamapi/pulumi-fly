import * as pulumi from "@pulumi/pulumi"
import default_axios from "axios"

const config = new pulumi.Config()
export const fly_api_key = config.requireSecret("fly_api_key")

export const getFlyClients = () => {
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
