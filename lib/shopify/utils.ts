export function nodeFromEdges<T>(obj: { edges: { node: T }[] }) {
  return obj.edges.map((i) => i.node)
}

export const nfe = nodeFromEdges
