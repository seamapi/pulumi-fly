# pulumi-fly

This is a dynamic resource that represents fly.io resources.

You can only use this pulumi resource in Typescript, it should only be used
until there is an official and well-maintained fly.io pulumi provider.

## Usage

`npm add pulumi-fly`

```ts
import { FlyApp, FlyIp, FlyMachine, flyRegistry } from "pulumi-fly"

const fly_app = new FlyApp("my-app", {
  app_name: "my_app",
  org_slug: "my_org",
})

const fly_ip = new FlyIp("public-ip-v6", {
  app_name: fly_app.app_name!,
  type: "v6",
})

export const ip = fly_ip.ip_address

const image = new docker.Image("my_app-image", {
  imageName: pulumi.interpolate`registry.fly.io/${fly_app.app_name}:latest`,
  build: {
    platform: "linux/amd64",
    context: "../",
  },
  registry: flyRegistry,
})

const fly_machine = new FlyMachine("fly-machine-1", {
  app_name: fly_app.app_name!,
  image: image.repoDigest as any,
  services: [
    {
      internal_port: 3070,
      protocol: "tcp",
      ports: [
        {
          handlers: ["http"],
          port: 80,
        },
      ],
    },
  ],
})
```

You are required to provide a secret, pulumi will tell you when you try to
run but the secret is `fly:fly_api_token`.

```bash
pulumi config set --secret fly:fly_api_key $(fly auth token)
```
