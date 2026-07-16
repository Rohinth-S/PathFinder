import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Svg, { Defs, Marker, Path, G } from 'react-native-svg';
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

  const { positionedNodes, positionedEdges, canvasWidth, canvasHeight } = useMemo(() => {
    if (nodes.length === 0) return { positionedNodes: [], positionedEdges: [], canvasWidth: 0, canvasHeight: 0 };

    const nodeMap = new Map<string, PositionedNode>();
    nodes.forEach(n => nodeMap.set(n.id, { ...n, x: 0, y: 0 }));

    // Topological sort for layering
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
    if (queue.length === 0 && nodes.length > 0) queue = [nodes[0].id];

    const visited = new Set<string>();
    while (queue.length > 0) {
      const nextQueue: string[] = [];
      for (const id of queue) {
        if (!visited.has(id)) {
          visited.add(id);
          layers.set(id, currentLayer);
          for (const n of (adj.get(id) || [])) nextQueue.push(n);
        }
      }
      queue = nextQueue;
      currentLayer++;
    }

    nodes.forEach(n => {
      if (!visited.has(n.id)) layers.set(n.id, Math.floor(Math.random() * currentLayer));
    });

    // Sort by layer
    const sortedNodeIds = nodes.map(n => n.id).sort((a, b) => (layers.get(a) || 0) - (layers.get(b) || 0));

    // Diagonal staircase layout — each node steps right and down
    const X_STEP = 200;
    const Y_STEP = 130;
    const PADDING = 100;
    const NODE_W = 150;

    sortedNodeIds.forEach((id, index) => {
      const pNode = nodeMap.get(id)!;
      pNode.x = PADDING + index * X_STEP;
      pNode.y = PADDING + index * Y_STEP;
    });

    const lastIdx = sortedNodeIds.length - 1;
    const cw = PADDING + lastIdx * X_STEP + NODE_W + PADDING;
    const ch = PADDING + lastIdx * Y_STEP + 80 + PADDING;

    const validEdges = edges.filter(e => nodeMap.has(e.fromId) && nodeMap.has(e.toId));

    return {
      positionedNodes: Array.from(nodeMap.values()),
      positionedEdges: validEdges.map(e => ({
        ...e,
        from: nodeMap.get(e.fromId)!,
        to: nodeMap.get(e.toId)!,
      })),
      canvasWidth: Math.max(cw, Dimensions.get('window').width - 32),
      canvasHeight: Math.max(ch, 300),
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
    // Smooth S-curve: go right first, then down
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  };

  return (
    <View style={{ marginVertical: 16, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#EAE7E0', height: 340 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        nestedScrollEnabled
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled
          contentContainerStyle={{ width: canvasWidth, height: canvasHeight }}
          style={{ flex: 1 }}
        >
          <View style={{ width: canvasWidth, height: canvasHeight, backgroundColor: '#FDFCF9' }}>
            {/* SVG edges */}
            <Svg width={canvasWidth} height={canvasHeight} style={{ position: 'absolute', top: 0, left: 0 }}>
              <Defs>
                <Marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <Path d="M 0 0 L 10 5 L 0 10 z" fill={L.teal} opacity={0.25} />
                </Marker>
              </Defs>

              {positionedEdges.map((edge, i) => {
                const startX = edge.from.x + 75;
                const startY = edge.from.y + 10;
                const endX = edge.to.x - 75;
                const endY = edge.to.y + 10;

                return (
                  <G key={`edge-${i}`}>
                    <Path
                      d={drawCurve(startX, startY, endX, endY)}
                      stroke={L.teal}
                      strokeOpacity={0.18}
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrow)"
                    />
                  </G>
                );
              })}
            </Svg>

            {/* Nodes */}
            {positionedNodes.map(node => (
              <TouchableOpacity
                key={node.id}
                onPress={() => handleNodePress(node.authorUsername)}
                activeOpacity={0.8}
                style={{
                  position: 'absolute',
                  left: node.x - 75,
                  top: node.y - 30,
                  width: 150,
                  minHeight: 60,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(62, 107, 102, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 8,
                  paddingVertical: 10,
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
                  <Text style={{ color: L.teal, fontSize: 11, fontFamily: 'Inter_500Medium' }} numberOfLines={1}>
                    {node.authorUsername ? `@${node.authorUsername}` : 'Explorer'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}
