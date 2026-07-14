import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, Defs, Marker, Path, G } from 'react-native-svg';
import { GraphNode, GraphEdge } from '../../api/community.api';
import { L } from '../../constants/colors';
import { useRouter } from 'expo-router';

interface VisualGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface PositionedNode extends GraphNode {
  x: number;
  y: number;
}

export function VisualGraph({ nodes, edges }: VisualGraphProps) {
  const router = useRouter();

  // Simple layout: arrange nodes in a left-to-right force-like layout
  // To avoid complex d3-force in RN, we'll use a deterministic layered layout.
  // We'll calculate indegree and outdegree to assign layers.
  const { positionedNodes, positionedEdges, width, height } = useMemo(() => {
    if (nodes.length === 0) return { positionedNodes: [], positionedEdges: [], width: 0, height: 0 };

    const nodeMap = new Map<string, PositionedNode>();
    nodes.forEach(n => nodeMap.set(n.id, { ...n, x: 0, y: 0 }));

    // Calculate layers (very naive topological sort / distance from sources)
    const layers = new Map<string, number>();
    const inDegrees = new Map<string, number>();
    const adj = new Map<string, string[]>();

    nodes.forEach(n => {
      inDegrees.set(n.id, 0);
      adj.set(n.id, []);
    });

    edges.forEach(e => {
      if (inDegrees.has(e.toId)) {
        inDegrees.set(e.toId, inDegrees.get(e.toId)! + 1);
      }
      if (adj.has(e.fromId)) {
        adj.get(e.fromId)!.push(e.toId);
      }
    });

    // Assign layers
    let currentLayer = 0;
    let queue = nodes.filter(n => inDegrees.get(n.id) === 0).map(n => n.id);
    
    // Fallback if there are cycles and no sources
    if (queue.length === 0 && nodes.length > 0) {
      queue = [nodes[0].id];
    }

    const visited = new Set<string>();

    while (queue.length > 0) {
      const nextQueue: string[] = [];
      for (const id of queue) {
        if (!visited.has(id)) {
          visited.add(id);
          layers.set(id, currentLayer);
          const neighbors = adj.get(id) || [];
          for (const n of neighbors) {
            nextQueue.push(n);
          }
        }
      }
      queue = nextQueue;
      currentLayer++;
    }

    // Any unvisited nodes (disconnected components or cyclic) just get assigned to random layers
    nodes.forEach(n => {
      if (!visited.has(n.id)) {
        layers.set(n.id, Math.floor(Math.random() * currentLayer));
      }
    });

    const maxLayer = Math.max(...Array.from(layers.values()));
    
    // Count nodes per layer to calculate vertical spacing
    const nodesPerLayer = new Map<number, string[]>();
    for (let i = 0; i <= maxLayer; i++) {
      nodesPerLayer.set(i, []);
    }
    
    Array.from(layers.entries()).forEach(([id, layer]) => {
      nodesPerLayer.get(layer)!.push(id);
    });

    const X_SPACING = 200;
    const Y_SPACING = 100;
    const padding = 50;

    let maxNodesInOneLayer = 0;
    for (let i = 0; i <= maxLayer; i++) {
      maxNodesInOneLayer = Math.max(maxNodesInOneLayer, nodesPerLayer.get(i)!.length);
    }

    const calculatedHeight = Math.max(300, maxNodesInOneLayer * Y_SPACING + padding * 2);
    const calculatedWidth = maxLayer * X_SPACING + padding * 2 + 150; // extra padding for last node

    // Position nodes
    for (let i = 0; i <= maxLayer; i++) {
      const layerNodes = nodesPerLayer.get(i)!;
      layerNodes.forEach((id, index) => {
        const pNode = nodeMap.get(id)!;
        pNode.x = padding + i * X_SPACING + 75; // center offset
        
        // Center vertically based on how many nodes in this layer
        const layerHeight = layerNodes.length * Y_SPACING;
        const startY = (calculatedHeight - layerHeight) / 2 + Y_SPACING / 2;
        pNode.y = startY + index * Y_SPACING;
      });
    }

    // Filter out edges with missing nodes
    const validEdges = edges.filter(e => nodeMap.has(e.fromId) && nodeMap.has(e.toId));

    return {
      positionedNodes: Array.from(nodeMap.values()),
      positionedEdges: validEdges.map(e => ({
        ...e,
        from: nodeMap.get(e.fromId)!,
        to: nodeMap.get(e.toId)!
      })),
      width: Math.max(Dimensions.get('window').width, calculatedWidth),
      height: calculatedHeight
    };
  }, [nodes, edges]);

  if (nodes.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center', backgroundColor: L.surface, borderRadius: 16, marginHorizontal: 16 }}>
        <Text style={{ color: L.navySoft, fontFamily: 'Inter_400Regular' }}>No trending paths found.</Text>
      </View>
    );
  }

  const handleNodePress = (authorUsername: string) => {
    router.push(`/u/${authorUsername}`);
  };

  const drawCurve = (x1: number, y1: number, x2: number, y2: number) => {
    const cp1x = x1 + (x2 - x1) / 2;
    const cp1y = y1;
    const cp2x = x1 + (x2 - x1) / 2;
    const cp2y = y2;
    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
      <View style={{ backgroundColor: '#FDFCF9', borderRadius: 24, overflow: 'hidden', marginHorizontal: 16, borderWidth: 1, borderColor: '#EAE7E0', width, height }}>
        <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
          <Defs>
            <Marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <Path d="M 0 0 L 10 5 L 0 10 z" fill={L.teal} opacity={0.6} />
            </Marker>
          </Defs>

          {/* Draw Edges */}
          {positionedEdges.map((edge, i) => {
            const midX = (edge.from.x + edge.to.x) / 2;
            const midY = (edge.from.y + edge.to.y) / 2;
            const startX = edge.from.x + 75;
            const endX = edge.to.x - 75;
            
            return (
              <G key={`edge-${i}`}>
                <Path
                  d={drawCurve(startX, edge.from.y, endX, edge.to.y)}
                  stroke={L.teal}
                  strokeOpacity={0.4}
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrow)"
                />
                {edge.label && (
                  <View style={{
                    position: 'absolute',
                    left: midX - 50,
                    top: midY - 12,
                    width: 100,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(253, 252, 249, 0.8)',
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 2
                  }}>
                    <Text style={{
                      color: L.navySoft,
                      fontSize: 10,
                      textAlign: 'center',
                      fontFamily: 'Inter_600SemiBold'
                    }}>
                      {edge.label}
                    </Text>
                  </View>
                )}
              </G>
            );
          })}
        </Svg>

        {/* Node Overlays for interaction and text */}
        {positionedNodes.map(node => (
          <TouchableOpacity
            key={node.id}
            onPress={() => handleNodePress(node.authorUsername)}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              left: node.x - 75,
              top: node.y - 32,
              width: 150,
              height: 64,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(62, 107, 102, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Text style={{ color: L.navy, fontSize: 13, fontFamily: 'Inter_600SemiBold', textAlign: 'center', marginBottom: 4 }} numberOfLines={2}>
              {node.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: L.teal, fontSize: 11, fontFamily: 'Inter_500Medium' }}>
                {node.authorUsername ? `@${node.authorUsername}` : 'Explorer'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
