import { Link, LinkProps } from 'react-router-dom'

const LinkWithPreservedQuery = (props: LinkProps) => (
  <Link {...props} to={{ pathname: props.to.toString(), search: window.location.search }} />
)

export default LinkWithPreservedQuery
