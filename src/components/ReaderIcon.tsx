import Svg, { G, Path } from 'react-native-svg';

export function ReaderIcon() {
  return <Svg width={80} height={80} viewBox="0 0 80 80" accessible={false}>
    <G fill="none" stroke="#D5D5D5" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 44 V59 Q18 63 22 63 H43 Q47 63 47 59 V44 Q47 40 43 40 H22 Q18 40 18 44 Z" />
      <Path d="M30 48 H35 M30 55 H35" />
      <Path d="M43 31 Q50 31 50 38 M43 23 Q58 23 58 38 M43 15 Q66 15 66 38" />
    </G>
  </Svg>;
}
