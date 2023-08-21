// https://github.com/superfly/flyctl/blob/master/api/resource_ip_addresses.go
// Takes AppID, IP
export const release_ip_query = `mutation($input: ReleaseIPAddressInput!) {
  releaseIpAddress(input: $input) {
    clientMutationId
  }
}`
