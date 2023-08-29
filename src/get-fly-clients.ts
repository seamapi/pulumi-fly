import type { Config, Output } from "@pulumi/pulumi"
import default_axios from "axios"

export const getFlyClients = (fly_api_key: string | Output<string>) => {
  const key = typeof fly_api_key === "string" ? fly_api_key : fly_api_key.get()
  const machineApi = default_axios.create({
    baseURL: "https://api.machines.dev",
    headers: {
      Authorization: `Bearer ${key}`,
    },
    validateStatus: () => true,
  } as any)
  const gqlApi = default_axios.create({
    baseURL: "https://api.fly.io/graphql",
    headers: {
      Authorization: `Bearer ${key}`,
    },
    validateStatus: () => true,
  } as any)
  return { machineApi, gqlApi }
}
