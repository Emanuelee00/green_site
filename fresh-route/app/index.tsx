import { Suspense, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, PanResponder, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useIsFocused, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Canvas } from "@react-three/fiber";
import { RouteCarouselScene } from "@/components/scene/RouteCarouselScene";
import { colors, heat } from "@/theme";
import { useRoute } from "@/hooks/useRoute";
import { DEMO_ROUTES, ROUTE_OPTIONS } from "@/data/demoRoutes";
import type { DemoRoute } from "@/types";

function DotRow({ active }: { active: number }) {
  return <View style={styles.dots}>{DEMO_ROUTES.map((route, index) => <View key={route.id} style={[styles.dot, index === active && styles.dotActive]} />)}</View>;
}

function RouteOption({ route, loading, onPress, cardWidth }: { route: DemoRoute; loading: boolean; onPress: () => void; cardWidth: number }) {
  const tone = heat[route.badge];
  return (
    <TouchableOpacity style={[styles.option, { width: cardWidth }]} onPress={onPress} activeOpacity={0.82} disabled={loading}>
      <View style={styles.optionTop}><Text style={styles.optionName} numberOfLines={2}>{route.to.label}</Text><Text style={[styles.score, { color: tone.color }]}>{Math.round(route.freshScore * 100)}%</Text></View>
      <Text style={styles.optionMeta}>{route.distance}  ·  {tone.label}</Text>
      <View style={styles.tagRow}>{route.highlights.map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}</View>
      <View style={[styles.optionAction, { borderColor: tone.color }]}>{loading ? <ActivityIndicator size="small" color={tone.color} /> : <Text style={[styles.optionActionText, { color: tone.color }]}>Choisir ce parcours  →</Text>}</View>
    </TouchableOpacity>
  );
}

function RouteSheet({ landmark, loadingId, onSelect }: { landmark: DemoRoute; loadingId: string | null; onSelect: (route: DemoRoute) => void }) {
  const options = ROUTE_OPTIONS[landmark.id];
  const { width: winWidth } = useWindowDimensions();
  const available = Math.min(winWidth, 860) - 32;
  const perRow = available >= 700 ? 4 : available >= 460 ? 3 : available >= 300 ? 2 : 1;
  const cardWidth = Math.max(140, Math.floor((available - 10 * (perRow - 1)) / perRow));
  return (
    <View style={styles.sheet}>
      <View style={styles.sheetHeader}><View><Text style={styles.eyebrow}>{options.length} PARCOURS DISPONIBLES</Text><Text style={styles.sheetTitle}>Depuis {landmark.from.label}</Text></View><View style={styles.live}><View style={styles.liveDot} /><Text style={styles.liveText}>Exemples</Text></View></View>
      <ScrollView style={styles.optionListScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionList}>
        {options.map((route) => <RouteOption key={route.id} route={route} cardWidth={cardWidth} loading={loadingId === route.id} onPress={() => onSelect(route)} />)}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter(), isFocused = useIsFocused();
  const { calculateFromDemo } = useRoute();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRoutes, setShowRoutes] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const panOffsetRef = useRef(0), navigatingRef = useRef(false);
  const current = DEMO_ROUTES[currentIndex];

  useEffect(() => setShowRoutes(false), [currentIndex]);
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8,
    onPanResponderMove: (_, gesture) => { panOffsetRef.current = gesture.dx; },
    onPanResponderRelease: (_, gesture) => { if (gesture.dx < -60) setCurrentIndex((i) => Math.min(i + 1, 3)); else if (gesture.dx > 60) setCurrentIndex((i) => Math.max(i - 1, 0)); panOffsetRef.current = 0; },
  })).current;

  const selectRoute = async (route: DemoRoute) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true; setLoadingId(route.id);
    try { const result = await calculateFromDemo(route); router.push({ pathname:"/route-detail", params:{ data:JSON.stringify(result), name:route.name } }); }
    finally { navigatingRef.current = false; setLoadingId(null); }
  };

  return (
    <View style={styles.root}>
      <View style={styles.shell} {...panResponder.panHandlers}>
        <View style={styles.scene} pointerEvents="none"><Canvas key={isFocused ? "focused" : "blurred"} camera={{ position:[0,0,7], fov:48 }} gl={{ antialias:true }}><Suspense fallback={null}><RouteCarouselScene routes={DEMO_ROUTES} currentIndex={currentIndex} panOffsetRef={panOffsetRef} onTap={() => setShowRoutes((v) => !v)} /></Suspense></Canvas></View>
        <TouchableOpacity style={styles.orbTarget} activeOpacity={1} onPress={() => setShowRoutes((v) => !v)} accessibilityLabel={`Voir les parcours pour ${current.name}`} />
        <SafeAreaView style={styles.safe} pointerEvents="box-none">
          <View style={styles.topBar}><View><Text style={styles.brand}>FRESH ROUTE</Text><Text style={styles.city}>MARSEILLE</Text></View><View style={styles.topBarActions}><TouchableOpacity style={styles.heatBtn} onPress={() => router.push("/heatmap")}><Text style={styles.heatBtnText}>◉  Carte thermique</Text></TouchableOpacity><TouchableOpacity style={styles.heatBtn} onPress={() => Linking.openURL("https://github.com/Emanuelee00/green_site")}><Text style={styles.heatBtnText}>{'</>'}  Code</Text></TouchableOpacity></View></View>
          <View style={styles.demoNote}><Text style={styles.demoNoteText}>Démo — le moteur de calcul (routing thermique) est hors ligne pour un hébergement gratuit. Les parcours ci-dessous sont des exemples.</Text></View>
          <View style={styles.hero}><Text style={styles.placeName}>{current.name}</Text><Text style={styles.placeDescription}>{current.description}</Text><DotRow active={currentIndex} /><Text style={styles.hint}>Glissez pour explorer  ·  Touchez l’objet pour voir les parcours</Text></View>
          <View style={styles.spacer} pointerEvents="none" />
          {showRoutes ? <RouteSheet landmark={current} loadingId={loadingId} onSelect={selectRoute} /> : <TouchableOpacity style={styles.discover} onPress={() => setShowRoutes(true)}><View><Text style={styles.discoverLabel}>PARCOURS À PROXIMITÉ</Text><Text style={styles.discoverTitle}>Afficher {ROUTE_OPTIONS[current.id].length} itinéraires</Text></View><Text style={styles.discoverArrow}>→</Text></TouchableOpacity>}
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:{flex:1,backgroundColor:"#07110b"},
  shell:{flex:1,width:"100%",maxWidth:860,alignSelf:"center",position:"relative",...(Platform.OS==="web"?{boxShadow:"0 0 80px rgba(0,0,0,0.6)"}:{})},
  safe:{flex:1}, scene:{position:"absolute",top:170,left:0,right:0,height:Platform.OS==="web"?"45%":"40%"}, orbTarget:{position:"absolute",top:170,left:"20%",right:"20%",height:240,zIndex:2},
  topBar:{zIndex:3,flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",rowGap:8,paddingHorizontal:24,paddingTop:Platform.OS==="web"?18:8}, brand:{color:colors.primary,fontSize:12,fontWeight:"900",letterSpacing:2.5},city:{color:colors.textDim,fontSize:10,fontWeight:"700",letterSpacing:3,marginTop:3},
  topBarActions:{flexDirection:"row",flexWrap:"wrap",gap:8},
  heatBtn:{backgroundColor:"rgba(13,32,24,.8)",borderWidth:1,borderColor:colors.cardBorder,borderRadius:22,paddingHorizontal:14,paddingVertical:9},heatBtnText:{color:colors.textSub,fontSize:12,fontWeight:"700"},
  hero:{zIndex:3,alignItems:"center",marginTop:24,paddingHorizontal:24},placeName:{color:colors.text,fontSize:28,fontWeight:"900",letterSpacing:-.7},placeDescription:{color:colors.textSub,fontSize:13,marginTop:6,textAlign:"center"},hint:{color:colors.textDim,fontSize:10,marginTop:11,letterSpacing:.3},dots:{flexDirection:"row",gap:6,marginTop:13},dot:{width:6,height:6,borderRadius:4,backgroundColor:colors.textMuted},dotActive:{width:24,backgroundColor:colors.primary},spacer:{flex:1},
  discover:{zIndex:4,margin:16,padding:20,borderRadius:22,backgroundColor:"rgba(15,35,25,.97)",borderWidth:1,borderColor:"#294b36",flexDirection:"row",alignItems:"center",justifyContent:"space-between"},discoverLabel:{color:colors.primary,fontSize:10,fontWeight:"900",letterSpacing:1.4},discoverTitle:{color:colors.text,fontSize:20,fontWeight:"800",marginTop:4},discoverArrow:{color:colors.primary,fontSize:30},
  sheet:{zIndex:4,backgroundColor:"rgba(8,22,14,.98)",borderTopWidth:1,borderColor:"#294333",paddingTop:18,paddingBottom:Platform.OS==="web"?22:10},sheetHeader:{paddingHorizontal:20,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},eyebrow:{color:colors.primary,fontSize:9,fontWeight:"900",letterSpacing:1.5},sheetTitle:{color:colors.text,fontSize:20,fontWeight:"800",marginTop:3},live:{flexDirection:"row",alignItems:"center",gap:6},liveDot:{width:7,height:7,borderRadius:4,backgroundColor:colors.primary},liveText:{color:colors.textDim,fontSize:10},optionListScroll:{maxHeight:420},optionList:{flexDirection:"row",flexWrap:"wrap",justifyContent:"center",paddingHorizontal:16,paddingTop:14,gap:10},
  option:{padding:14,borderRadius:18,backgroundColor:"#10251a",borderWidth:1,borderColor:"#223d2d"},optionTop:{flexDirection:"row",justifyContent:"space-between",gap:8},optionName:{color:colors.text,fontSize:15,fontWeight:"800",flex:1},score:{fontSize:16,fontWeight:"900"},optionMeta:{color:colors.textSub,fontSize:10,marginTop:5},tagRow:{flexDirection:"row",gap:5,marginTop:10},tag:{color:colors.textDim,fontSize:9,backgroundColor:"#0a1911",paddingHorizontal:7,paddingVertical:4,borderRadius:8},optionAction:{height:32,borderRadius:10,borderWidth:1,alignItems:"center",justifyContent:"center",marginTop:12},optionActionText:{fontSize:10,fontWeight:"800"},
  demoNote:{zIndex:3,marginHorizontal:24,marginTop:10,paddingHorizontal:12,paddingVertical:8,borderRadius:10,backgroundColor:"rgba(20,18,10,0.9)",borderWidth:1,borderColor:"rgba(245,158,11,0.4)"},demoNoteText:{color:"#e2e8f0",fontSize:10.5,lineHeight:15},
});
