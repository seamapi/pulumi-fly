import * as pulumi from "@pulumi/pulumi"
import { ResourceParams } from "./util"
import { getFlyClients } from "./get-fly-clients"
import { FlyConfigProps } from "./fly-config-props"

export interface FlyMachineInputs {
  app_name: string
  image: string
  machine_name?: string
  env?: Record<string, string>
  services?: Array<{
    ports: Array<{
      port: number
      handlers: Array<"tls" | "http">
    }>
    protocol: "tcp" | "udp"
    internal_port: number
  }>
  checks?: Record<
    string,
    {
      type: "http"
      port: number
      method: "GET" | "POST"
      path: string
      interval: string
      timeout: string
    }
  >
}

// type FlyMachineCreateResponse = {
//   id: '6e82d57f054087',
//   name: 'hidden-voice-3626',
//   state: 'created',
//   region: 'sjc',
//   instance_id: '01H8B5P9V8AY13Q6CWDA8B8YSD',
//   private_ip: 'fdaa:2:d431:a7b:ad1:6fd7:f9dc:2',
//   config: {
//     init: {},
//     services: [ [Object] ],
//     image: 'registry.fly.io/devicedb-prod@sha256:6b50cafe67a756625d57ba637c9b4dcae68cfbb52b5339b0cb3648abfc7b73e0',
//     restart: {},
//     guest: { cpu_kind: 'shared', cpus: 1, memory_mb: 256 }
//   },
//   image_ref: {
//     registry: 'registry.fly.io',
//     repository: 'devicedb-prod',
//     tag: '',
//     digest: 'sha256:6b50cafe67a756625d57ba637c9b4dcae68cfbb52b5339b0cb3648abfc7b73e0',
//     labels: null
//   },
//   created_at: '2023-08-21T04:29:47Z',
//   updated_at: '2023-08-21T04:29:47Z',
//   events: [
//     {
//       id: '01H8B5P9VW0VEVDSMDYS7C5F34',
//       type: 'launch',
//       status: 'created',
//       source: 'user',
//       timestamp: 1692592187260
//     }
//   ]
// }

export interface FlyMachineOutputs {
  machine_id: string
  private_ip: string
  app_name: string
}

export const createFlyMachineProvider = (config: FlyConfigProps) => {
  const FlyMachineProvider: pulumi.dynamic.ResourceProvider<
    FlyMachineInputs,
    FlyMachineOutputs
  > = {
    async create(inputs) {
      const { app_name, image, machine_name } = inputs
      const { gqlApi, machineApi } = getFlyClients(config.fly_auth_token)

      let res = await machineApi.post(`/v1/apps/${app_name}/machines`, {
        name: machine_name,
        config: {
          image,
          env: inputs.env,
          services: inputs.services,
          checks: inputs.checks,
        },
      })

      const { id: machine_id, state: initial_machine_state } = res.data

      return {
        id: machine_id,
        outs: {
          machine_id,
          app_name,
          private_ip: res.data.private_ip,
        },
      }
    },

    async update(id, olds, news) {
      const { machineApi } = getFlyClients(config.fly_auth_token)
      const { image } = news
      const res = await machineApi.post(
        `/v1/apps/${news.app_name}/machines/${olds.machine_id}`,
        {
          config: {
            image,
            env: news.env,
            services: news.services,
            checks: news.checks,
          },
        }
      )

      if (res.status !== 200) {
        throw new Error(
          `Error updating machine: ${JSON.stringify(res.data, null, "  ")}`
        )
      }

      return {
        id,
        outs: {
          machine_id: olds.machine_id,
          app_name: olds.app_name,
          private_ip: res.data.private_ip,
        },
      }
    },

    async delete(id, props) {
      const { machineApi } = getFlyClients(config.fly_auth_token)
      const res = await machineApi.delete(
        `/v1/apps/${props.app_name}/machines/${props.machine_id}?force=true`
      )
      if (!res.data.ok) {
        throw new Error(
          `Error deleting machine: ${JSON.stringify(res.data, null, "  ")}`
        )
      }
    },
  }
  return FlyMachineProvider
}

export class FlyMachine extends pulumi.dynamic.Resource {
  constructor(
    name: string,
    props: ResourceParams<FlyMachineInputs>,
    opts: pulumi.CustomResourceOptions & FlyConfigProps
  ) {
    super(createFlyMachineProvider(opts), name, props, opts)
  }
}
