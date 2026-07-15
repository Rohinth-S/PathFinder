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

    let currentLayer = 0;
    let queue = nodes.filter(n => inDegrees.get(n.id) === 0).map(n => n.id);
    
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

    nodes.forEach(n => {
      if (!visited.has(n.id)) {
        layers.set(n.id, Math.floor(Math.random() * currentLayer));
      }
    });

    // Sort nodes to form a single vertical list based on layer
    const sortedNodeIds = nodes.map(n => n.id).sort((a, b) => {
      const layerA = layers.get(a) || 0;
      const layerB = layers.get(b) || 0;
      return layerA - layerB;
    });

    const screenWidth = Dimensions.get('window').width - 32;
    const calculatedWidth = screenWidth;
    const Y_SPACING = 110;
    const padding = 40;
    const calculatedHeight = sortedNodeIds.length * Y_SPACING + padding * 2;
    const X_OFFSET = 60;

    sortedNodeIds.forEach((id, index) => {
      const pNode = nodeMap.get(id)!;
      pNode.y = padding + index * Y_SPACING + 32; // center offset
      pNode.x = (screenWidth / 2) + (index % 2 === 0 ? -X_OFFSET : X_OFFSET);
    });

    const validEdges = edges.filter(e => nodeMap.has(e.fromId) && nodeMap.has(e.toId));

    return {
      positionedNodes: Array.from(nodeMap.values()),
      positionedEdges: validEdges.map(e => ({
        ...e,
        from: nodeMap.get(e.fromId)!,
        to: nodeMap.get(e.toId)!
      })),
      width: calculatedWidth,
      height: calculatedHeight
    };
  }, [nodes, edges]);

  if (nodes.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center', backgroundColor: L.surface, borderRadius: 16 }}>
        <Text style={{ color: L.navySoft, fontFamily: 'Inter_400Regular' }}>No trending paths found.</Text>
      </View>
    );
  }

  const handleNodePress = (authorUsername: string) => {
    router.push(`/u/${authorUsername}`);
  };

  const drawCurve = (x1: number, y1: number, x2: number, y2: number) => {
    const cp1x = x1;
    const cp1y = y1 + (y2 - y1) / 2;
    const cp2x = x2;
    const cp2y = y1 + (y2 - y1) / 2;
    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  };

  return (
    <View style={{ marginVertical: 16 }}>
      <View style={{ backgroundColor: '#FDFCF9', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#EAE7E0', width: '100%', height }}>
        <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
          <Defs>
            <Marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="5"
              refY="10"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <Path d="M 0 0 L 10 0 L 5 10 z" fill={L.teal} opacity={0.6} />
            </Marker>
          </Defs>

          {positionedEdges.map((edge, i) => {
            const midX = (edge.from.x + edge.to.x) / 2;
            const midY = (edge.from.y + edge.to.y) / 2;
            const startY = edge.from.y + 32;
            const endY = edge.to.y - 32;
            
            return (
              <G key={`edge-${i}`}>
                <Path
                  d={drawCurve(edge.from.x, startY, edge.to.x, endY)}
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
    </View>
  );
}

