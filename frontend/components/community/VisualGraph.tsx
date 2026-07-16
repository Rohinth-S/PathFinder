          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
          borderWidth: 1,
          borderColor: 'rgba(62, 107, 102, 0.1)',
        }}>
          <Pressable 
            onPress={handleZoomOut}
            style={{ padding: 10, opacity: scale <= 0.4 ? 0.3 : 1 }}
            disabled={scale <= 0.4}
          >
            <Feather name="zoom-out" size={20} color={L.navy} />
          </Pressable>
          <View style={{ width: 1, backgroundColor: 'rgba(62, 107, 102, 0.1)', marginVertical: 8 }} />
          <Pressable 
            onPress={handleZoomIn}
            style={{ padding: 10, opacity: scale >= 2.5 ? 0.3 : 1 }}
            disabled={scale >= 2.5}
          >
            <Feather name="zoom-in" size={20} color={L.navy} />
          </Pressable>
        </View>
      </View>
    </PinchGestureHandler>
  );
}
