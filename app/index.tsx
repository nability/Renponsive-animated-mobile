import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Easing,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// --- KOMPONEN KARTU GRID (DIPISAH AGAR BISA KLIK SATU-SATU) ---
const GridItem = ({ item, index, entranceAnim, isTablet }) => {
  // Animasi Scale khusus untuk interaksi klik
  const clickAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Efek Membal (Sequence: Kecil -> Besar -> Normal)
    Animated.sequence([
      Animated.timing(clickAnim, {
        toValue: 0.8, // Mengecil drastis
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(clickAnim, {
        toValue: 1, // Kembali normal dengan efek pegas
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={{
        width: isTablet ? "48%" : "100%",
        marginBottom: 10,
      }}
    >
      <Animated.View
        style={[
          styles.gridItem,
          {
            // Gabungkan animasi entrance (muncul) dan animasi klik
            opacity: entranceAnim, 
            transform: [
              { scale: Animated.multiply(entranceAnim, clickAnim) }, // Multiply menggabungkan 2 animasi scale
              {
                translateY: entranceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Card {item}</Text>
        <Text style={{ color: "#E1F5FE", fontSize: 10 }}>Klik Saya!</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// --- KOMPONEN UTAMA ---
export default function ComponentDemo() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;

  // Setup Animasi Entrance (Muncul Awal)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Array Value untuk Entrance Grid
  const gridAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Setup Animasi Tombol Bawah
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Reset Value (Penting untuk Hot Reload)
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    gridAnims.forEach((anim) => anim.setValue(0));

    // 2. Jalankan Sequence Entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.stagger(150,
        gridAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  }, []);

  // Handler Tombol Bawah (Tekan Tahan)
  const onPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header & Flexbox Section */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.title}>Interaksi Klik & Animasi</Text>

          <Text style={styles.sectionTitle}>1. Flexbox (Static)</Text>
          <View style={styles.flexBoxExample}>
            <View style={[styles.box, { backgroundColor: "#0288D1" }]} />
            <View style={[styles.box, { backgroundColor: "#03A9F4" }]} />
            <View style={[styles.box, { backgroundColor: "#4FC3F7" }]} />
          </View>

          <Text style={styles.sectionTitle}>2. Input & Image</Text>
          <TextInput
            placeholder="Ketik sesuatu..."
            style={[styles.input, { fontSize: width * 0.04 }]}
          />
          <Image
            source={{ uri: "https://picsum.photos/500" }}
            style={{ width: "100%", height: width * 0.5, borderRadius: 10 }}
          />
        </Animated.View>

        {/* 3. GRID INTERAKTIF (Yang baru ditambahkan) */}
        <Text style={styles.sectionTitle}>3. Grid (Coba Klik Kartunya!)</Text>
        <View style={styles.gridWrap}>
          {[1, 2, 3, 4].map((item, index) => (
            <GridItem 
              key={item}
              item={item}
              index={index}
              entranceAnim={gridAnims[index]} // Kirim value animasi entrance
              isTablet={isTablet}
            />
          ))}
        </View>

        {/* 4. Tombol Bawah */}
        <Text style={styles.sectionTitle}>4. Tombol (Tekan Tahan)</Text>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Animated.View
            style={[
              styles.button,
              {
                height: width * 0.14,
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <Text style={[styles.buttonText, { fontSize: width * 0.045 }]}>
              Tekan Saya Lama-lama
            </Text>
          </Animated.View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E3F2FD",
  },
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#01579B",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  flexBoxExample: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  box: {
    width: 80,
    height: 80,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    width: "100%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#B3E5FC",
  },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  // Style Grid Item dipindah ke dalam component GridItem, tapi base style disini
  gridItem: {
    height: 100,
    backgroundColor: "#0288D1",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  button: {
    width: "100%",
    backgroundColor: "#FF7043", // Ganti warna biar beda
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});