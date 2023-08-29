import * as pulumi from "@pulumi/pulumi"

export interface FlyConfigProps {
  fly_auth_token: string | pulumi.Output<string>
}
