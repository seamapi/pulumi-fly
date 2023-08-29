import { FlyConfigProps } from "./fly-config-props"

export const getFlyRegistry = (config: FlyConfigProps) => ({
  hostName: "registry.fly.io",
  userName: "x",
  password:
    typeof config.fly_auth_token === "string"
      ? config.fly_auth_token
      : config.fly_auth_token.get(),
})
