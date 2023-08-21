import type { Config, Output } from "@pulumi/pulumi"
import default_axios from "axios"

export const getFlyClients = (fly_api_key?: Output<string>) => {
  if (!fly_api_key) {
    console.log("creating fly config")
    throw new Error("config is required")
  }
  console.log("getting api key")
  // const fly_api_key = config.requireSecret("fly_api_key")
  console.log("got api key")

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
