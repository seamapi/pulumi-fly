import * as pulumi from "@pulumi/pulumi"
export type ResourceParams<T> = {
  [K in keyof T]: pulumi.Output<T[K]> | T[K]
}
