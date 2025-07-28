/* layout.js */
// This will be loaded as a regular script, not an ES module
// We'll load ELK and dagre from CDN

/** Translates our in‑memory nodes/edges into ELK format and lays them out. */
async function elkLayout(nodes, edges, direction = "RIGHT") {
  const elk = new ELK();
  const g = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": direction,
      "elk.spacing.nodeNode": "80",
      "elk.layered.spacing.nodeNodeBetweenLayers": "120",
      "elk.layered.considerModelOrder.strategy": "PREFER_EDGES",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
      "elk.layered.compaction.postCompaction.strategy": "LEFT",
      "elk.spacing.edgeNode": "30",
      "elk.spacing.portPort": "20",
      "elk.layered.thoroughness": "10"
    },
    children: nodes.map(n => ({
      id: n.id, width: n.width, height: n.height
    })),
    edges: edges.map(e => ({
      id: `${e.from}->${e.to}`,
      sources: [e.from], targets: [e.to]
    }))
  };
  const { children } = await elk.layout(g);
  const pos = new Map(children.map(c => [c.id, { x: c.x, y: c.y }]));
  return pos;
}

/** Dagre fallback (hierarchical) */
function dagreLayout(nodes, edges, direction = "LR") {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ 
    rankdir: direction, 
    nodesep: 80,      // Horizontal spacing between nodes
    ranksep: 120,     // Spacing between ranks/layers
    edgesep: 30,      // Spacing between edges
    marginx: 20,      // Margin around the graph
    marginy: 20,
    acyclicer: "greedy",
    ranker: "network-simplex"  // Better ranking algorithm
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(n => g.setNode(n.id, { width: n.width, height: n.height }));
  edges.forEach(e => g.setEdge(e.from, e.to));

  dagre.layout(g);
  const pos = new Map(
    nodes.map(n => {
      const { x, y } = g.node(n.id);
      return [n.id, { x, y }];
    })
  );
  return pos;
}
