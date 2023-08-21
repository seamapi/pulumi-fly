// https://github.com/superfly/flyctl/blob/master/api/resource_apps.go
export const organization_details_query = `

query($slug: String!) {
  organization_details: organization(slug: $slug) {
    id
    slug
    name
    type
    viewerRole
    internalNumericId
    remoteBuilderImage
    remoteBuilderApp {
      name
    }
    members {
      edges {
        cursor
        node {
          id
          name
          email
        }
        joinedAt
        role
      }
    }
  }
}


`
