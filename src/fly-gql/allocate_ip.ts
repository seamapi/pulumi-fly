// https://github.com/superfly/flyctl/blob/master/api/resource_ip_addresses.go
export const allocate_ip_query = `mutation($input: AllocateIPAddressInput!) {
  allocateIpAddress(input: $input) {
    ipAddress {
      id
      address
      type
      region
      createdAt
    }
  }
}`
