import { getFlyClients } from "./get-fly-clients"
import { ResourceParams } from "./util"
import * as pulumi from "@pulumi/pulumi"
import { allocate_ip_query } from "./fly-gql/allocate_ip"
import { release_ip_query } from "./fly-gql/release_ip"

export interface FlyIpInputs {
  app_name: string
  type: "v4" | "v6"
}

export interface FlyIpOutputs {
  ip_address: string
  type: string
  region: string
  created_at: string
  app_name: string
}

export const createFlyIpProvider = (config: pulumi.Config) => {
  const fly_api_key = config.requireSecret("fly_api_key")
  const FlyIpProvider: pulumi.dynamic.ResourceProvider<
    FlyIpInputs,
    FlyIpOutputs
  > = {
    create: async (inputs) => {
      const { gqlApi, machineApi } = await getFlyClients(fly_api_key)

      let res = await gqlApi.post("/", {
        query: allocate_ip_query,
        variables: {
          input: {
            type: inputs.type,
            appId: inputs.app_name,
          },
        },
      })

      if (res.data.errors) {
        throw new Error(
          `[${res.status}] GQL ${JSON.stringify(res.data.errors, null, "  ")}`
        )
      }

      const { ipAddress } = res.data.data.allocateIpAddress

      return {
        id: ipAddress.id,
        outs: {
          ip_address: ipAddress.address,
          type: ipAddress.type,
          region: ipAddress.region,
          created_at: ipAddress.createdAt,
          app_name: inputs.app_name,
        },
      }
    },
    async update(id, olds, news) {
      throw new Error("Didn't implement v4 & v6")
    },
    async delete(id, props) {
      const { gqlApi, machineApi } = await getFlyClients(fly_api_key)

      const res = await gqlApi.post("/", {
        query: release_ip_query,
        variables: {
          input: {
            appId: props.app_name,
            ipAddressId: id,
          },
        },
      })

      if (res.data.errors) {
        throw new Error(
          `[${res.status}] GQL ${JSON.stringify(res.data, null, "  ")}`
        )
      }
    },
  }

  return FlyIpProvider
}

export class FlyIp extends pulumi.dynamic.Resource {
  public readonly ip_address?: pulumi.Output<string>
  public readonly type?: pulumi.Output<string>
  public readonly region?: pulumi.Output<string>
  public readonly created_at?: pulumi.Output<string>
  public readonly app_name?: pulumi.Output<string>

  constructor(
    name: string,
    props: ResourceParams<FlyIpInputs>,
    opts: pulumi.CustomResourceOptions & { config: pulumi.Config }
  ) {
    super(
      createFlyIpProvider(opts.config),
      name,
      {
        ip_address: undefined,
        region: undefined,
        created_at: undefined,
        ...props,
      },
      opts
    )
  }
}
