import type { Config, Output } from "@pulumi/pulumi"
import default_axios from "axios"

export const getFlyClients = (fly_api_key: Output<string>) => {
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
