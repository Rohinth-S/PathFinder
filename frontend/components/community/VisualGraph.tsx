import React, { useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import Svg, { Marker, Path, G, Defs } from 'react-native-svg';
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
  const scrollViewRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;

  const { positionedNodes, positionedEdges, width, height } = useMemo(() => {
    if (nodes.length === 0) return { positionedNodes: [], positionedEdges: [], width: 0, height: 0 };

    const nodeMap = new Map<string, PositionedNode>();
    nodes.forEach(n => nodeMap.set(n.id, { ...n, x: 0, y: 0 }));

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

    let queue = nodes.filter(n => inDegrees.get(n.id) === 0).map(n => n.id);
    if (queue.length === 0 && nodes.length > 0) {
      queue = [nodes[0].id];
    }

    const visited = new Set<string>();
    let currentLayer = 0;

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

    let unvisitedIndex = 0;
    nodes.forEach(n => {
      if (!visited.has(n.id)) {
        layers.set(n.id, unvisitedIndex % 3);
        unvisitedIndex++;
      }
    });

    const maxLayerOriginal = Math.max(0, ...Array.from(layers.values()));
    const nodesPerLayerOriginal = new Map<number, string[]>();
    for (let i = 0; i <= maxLayerOriginal; i++) {
      nodesPerLayerOriginal.set(i, []);
    }

    Array.from(layers.entries()).forEach(([id, layer]) => {
      nodesPerLayerOriginal.get(layer)!.push(id);
    });

    const MAX_NODES_PER_LAYER = 5;
    const balancedLayers: string[][] = [];

    for (let i = 0; i <= maxLayerOriginal; i++) {
      const arr = nodesPerLayerOriginal.get(i) || [];
      if (arr.length === 0 && balancedLayers.length > 0) {
        balancedLayers.push([]);
        continue;
      }
      for (let j = 0; j < arr.length; j += MAX_NODES_PER_LAYER) {
        balancedLayers.push(arr.slice(j, j + MAX_NODES_PER_LAYER));
      }
    }

    // ── SUPER COMPACT MEASUREMENTS FOR EXCELLENT MOBILE FITTING ──
    const CARD_WIDTH = 135;
    const X_SPACING = 165; // Highly packed columns
    const Y_SPACING = 80;  // Clean, tight vertical rows
    const paddingLeftRight = 16;
    const paddingTopBottom = 20;

    const actualMaxLayer = Math.max(0, balancedLayers.length - 1);
    let maxNodesInOneLayer = 0;
    balancedLayers.forEach(layerNodes => {
      maxNodesInOneLayer = Math.max(maxNodesInOneLayer, layerNodes.length);
    });

    // Perfect structural canvas height bounds based on item size
    const calculatedHeight = Math.max(280, maxNodesInOneLayer * Y_SPACING + paddingTopBottom * 2);
    const calculatedWidth = actualMaxLayer * X_SPACING + paddingLeftRight * 2 + CARD_WIDTH + 10;

    balancedLayers.forEach((layerNodes, i) => {
      layerNodes.forEach((id, index) => {
        const pNode = nodeMap.get(id)!;
        pNode.x = paddingLeftRight + i * X_SPACING + (CARD_WIDTH / 2);

        const layerHeight = layerNodes.length * Y_SPACING;
        const startY = (calculatedHeight - layerHeight) / 2 + Y_SPACING / 2;
        pNode.y = startY + index * Y_SPACING;
      });
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
      <View style={{ padding: 16, alignItems: 'center', backgroundColor: L.surface, borderRadius: 12, marginHorizontal: 16 }}>
        <Text style={{ color: L.navySoft, fontFamily: 'Inter_400Regular', fontSize: 13 }}>No trending paths found.</Text>
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
    <View style={{ marginVertical: 4, height: height, width: '100%', overflow: 'hidden' }}>
      <GHScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ width: Math.max(screenWidth, width), height: height }}
        decelerationRate="fast"
      >
        <View style={{ backgroundColor: '#FDFCF9', width: width, height: height }}>
          <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <Defs>
              <Marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <Path d="M 0 1 L 9 5 L 0 9 z" fill="#94A3B8" opacity={0.7} />
              </Marker>
            </Defs>

            {positionedEdges.map((edge, i) => {
              const startX = edge.from.x + 67; // Connects accurately from right side edge of card
              const endX = edge.to.x - 67;   // Connects accurately into left side edge of card
              return (
                <G key={`edge-${i}`}>
                  <Path
                    d={drawCurve(startX, edge.from.y, endX, edge.to.y)}
                    stroke={L.teal}
                    strokeOpacity={0.4}
                    strokeWidth="1.2"
                    fill="none"
                    markerEnd="url(#arrow)"
                  />
                </G>
              );
            })}
          </Svg>

          {positionedNodes.map(node => (
            <TouchableOpacity
              key={node.id}
              onPress={() => handleNodePress(node.authorUsername)}
              activeOpacity={0.85}
              style={{
                position: 'absolute',
                left: node.x - 67.5, // 135 Card Width / 2
                top: node.y - 27.5,  // 55 Card Height / 2
                width: 135,
                height: 55,
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingHorizontal: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 2,
                elevation: 1.5,
              }}
            >
              <Text style={{ color: L.navy, fontSize: 10, fontFamily: 'Inter_600SemiBold', textAlign: 'left', marginBottom: 1, lineHeight: 13 }} numberOfLines={2}>
                {node.title}
              </Text>
              <Text style={{ color:L.teal, fontSize: 8, fontFamily: 'Inter_500Medium' }} numberOfLines={1}>
                {node.authorUsername ? `@${node.authorUsername}` : '@explorer'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GHScrollView>
    </View>
  );
}