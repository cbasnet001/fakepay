import Svg, { G, Path } from 'react-native-svg';

// Hand-drawn geometry, deliberately independent of any system asset.
export function FaceScanIcon({ size = 110 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 80 80" accessible={false}>
    <G fill="none" stroke="#FFFFFF" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M25 9 H18 Q9 9 9 18 V25 M55 9 H62 Q71 9 71 18 V25 M9 55 V62 Q9 71 18 71 H25 M71 55 V62 Q71 71 62 71 H55" />
      <Path d="M28 29 V35 M52 29 V35 M40 34 V43 Q40 45 37 45" />
      <Path d="M28 52 Q40 64 53 51" />
    </G>
  </Svg>;
}
