/** Original vector artwork: shared palette with the live canvas characters. */
export function CrewArt({color='#8ef2d2',compact=false}:{color?:string;compact?:boolean}){
 return <svg viewBox="0 0 320 360" role="img" aria-label="Masked thief holding a bottled alarm" className={compact?'crew-art compact':'crew-art'}>
 <ellipse cx="160" cy="330" rx="115" ry="18" fill="#030b18" opacity=".4"/>
 <path d="M94 250 83 324Q106 343 127 326L146 265M178 261 190 328Q217 339 237 321L222 246" fill="#172638" stroke="#080f1d" strokeWidth="8"/>
 <path d="M101 175Q158 149 212 177L231 267Q171 295 94 263Z" fill={color} stroke="#102131" strokeWidth="8"/>
 <path d="m137 174 21 103 37-105" fill="#20384a"/><path d="M102 182Q62 191 47 238L77 254 124 210" fill={color} stroke="#102131" strokeWidth="8"/>
 <path d="M208 181Q239 184 262 218L241 245 196 214" fill={color} stroke="#102131" strokeWidth="8"/>
 <ellipse cx="161" cy="117" rx="72" ry="76" fill={color} stroke="#102131" strokeWidth="8"/>
 <path d="M107 111Q160 83 216 109L209 151Q192 188 153 181 114 176 107 141Z" fill="#efc39a"/>
 <path d="M104 107Q155 92 218 109L212 139Q191 155 169 136 149 153 112 138Z" fill="#182538"/>
 <path d="m119 121 28-4-4 14-20 1M180 117l25 5-4 10-18-1" fill="#fff8dc"/>
 <path d="M151 155q22 17 40-4" fill="#fff5d8" stroke="#835348" strokeWidth="4" strokeLinejoin="round"/>
 <path d="M93 88 107 43Q159 12 214 49L232 94Q164 72 93 88Z" fill={color} stroke="#102131" strokeWidth="8"/>
 <path d="m123 49 57-8" stroke="#efffe0" strokeWidth="7" strokeLinecap="round" opacity=".5"/>
 <path d="m211 64 39 14-25 13" fill={color} stroke="#102131" strokeWidth="6"/>
 <g transform="rotate(18 249 246)"><rect x="219" y="211" width="61" height="80" rx="24" fill="#ff947e" stroke="#402a40" strokeWidth="7"/><rect x="228" y="199" width="43" height="20" rx="5" fill="#eac684" stroke="#402a40" strokeWidth="5"/><path d="m247 233 13-4v30q-16 12-17-1 0-6 11-7v-12l-7 2Z" fill="#5a2d49"/><path d="m230 230v35" stroke="#ffdebd" strokeWidth="5" strokeLinecap="round"/></g>
 <path d="m287 222 16-9m-13 36 18 3m-23 23 13 12" stroke="#ffb79b" strokeWidth="5" strokeLinecap="round"/>
 <path d="M120 221h20" stroke="#e5fbe0" strokeWidth="4"/>
 </svg>;
}
