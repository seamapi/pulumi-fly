import { getFlyClients } from "./get-fly-clients"
import type { ResourceParams } from "./util"
import * as pulumi from "@pulumi/pulumi"
import { organization_details_query } from "./fly-gql/organization_details"
import type { FlyConfigProps } from "./fly-config-props"

export interface FlyAppInputs {
  app_name: string
  org_slug: string
}

export interface FlyAppOutputs {
  created_app_name: string
}

export class FlyApp extends pulumi.dynamic.Resource {
  public readonly app_name: pulumi.Output<string>
  public readonly created_app_name: pulumi.Output<string>

  constructor(
    name: string,
    props: ResourceParams<FlyAppInputs>,
    opts: pulumi.CustomResourceOptions & FlyConfigProps
  ) {
    super(
      createFlyAppProvider(opts),
      name,
      {
        app_name: undefined,
        created_app_name: undefined,
        ...props,
      },
      opts
    )
  }
}

export const createFlyAppProvider = (config: FlyConfigProps) => {
  const FlyAppProvider: pulumi.dynamic.ResourceProvider<
    FlyAppInputs,
    FlyAppOutputs
  > = {
    async create(inputs) {
      const { app_name, org_slug } = inputs
      const { gqlApi, machineApi } = await getFlyClients(config.fly_auth_token)

      const {
        data: { organization_details },
      } = await gqlApi.post("/", {
        query: organization_details_query,
        variables: {
          slug: org_slug,
        },
      })

      // Let's create the app
      let res
      res = await machineApi.post("/v1/apps", {
        app_name,
        org_slug,
      })

      if (res.data?.error) throw new Error(res.data?.error)

      // Find the app in the app list
      res = await machineApi.get(`/v1/apps/${app_name}`)

      return {
        id: res.data.name,
        outs: {
          created_app_name: res.data.name,
        },
      }
    },

    async delete(id, props) {
      const { gqlApi, machineApi } = await getFlyClients(config.fly_auth_token)
      const res = await machineApi.delete(`/v1/apps/${id}`)
      if (res.status !== 200) {
        throw new Error(
          `[${res.status}] DELETE /v1/apps/${id} ${res.data?.error}`
        )
      }
    },

    async read(id, props) {
      const { gqlApi, machineApi } = await getFlyClients(config.fly_auth_token)
      const res = await machineApi.get(`/v1/apps/${id}`)

      if (res.status !== 200) {
        throw new Error(`[${res.status}] GET /v1/apps/${id} ${res.data?.error}`)
      }

      return {
        id: res.data.name,
        outs: {
          created_app_name: res.data.name,
        },
      }
    },
  }

  return FlyAppProvider
}
